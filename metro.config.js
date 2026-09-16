const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Workaround for Windows file watching bottleneck:
// When Watchman is not installed on Windows, Metro falls back to FallbackWatcher,
// which recursively walks the filesystem and attaches individual fs.watch listeners to
// over 13,000+ directories (node_modules, android, etc.). This exhausts Windows handles,
// triggers 240s watch timeouts, and leaves DependencyGraph._fileSystem undefined,
// leading to: "TypeError: Cannot read properties of undefined (reading 'exists')".
//
// Node.js on Windows supports native recursive filesystem watching via ReadDirectoryChangesW.
// Enabling NativeWatcher on Windows allows Metro to watch the root directory instantly (<10ms).
if (process.platform === 'win32') {
  const patchWatcherClass = (WatcherClass) => {
    if (WatcherClass && typeof WatcherClass.isSupported === 'function') {
      WatcherClass.isSupported = () => true;
      if (WatcherClass.prototype && !WatcherClass.prototype._windowsPatched) {
        WatcherClass.prototype._windowsPatched = true;
        const origEmitError = WatcherClass.prototype.emitError;
        WatcherClass.prototype.emitError = function (error) {
          if (
            error &&
            (error.code === 'ENOENT' ||
              error.code === 'EPERM' ||
              error.code === 'EBUSY' ||
              error.code === 'UNKNOWN')
          ) {
            return;
          }
          return origEmitError.call(this, error);
        };
      }
    }
  };

  const tryPatch = (getter) => {
    try {
      const mod = getter();
      patchWatcherClass(mod.default || mod);
    } catch {}
  };

  // 1. @expo/metro-file-map (used by Expo CLI's createFileMap fork)
  tryPatch(() => require('@expo/metro-file-map/build/watchers/NativeWatcher'));

  // 2. Root metro-file-map
  tryPatch(() => {
    const mf = require.resolve('metro-file-map');
    return require(path.join(path.dirname(mf), 'watchers', 'NativeWatcher.js'));
  });

  // 3. Nested @expo/metro metro-file-map
  tryPatch(() => {
    const mf = require.resolve('metro-file-map', {
      paths: [path.join(__dirname, 'node_modules/@expo/metro/node_modules/metro')]
    });
    return require(path.join(path.dirname(mf), 'watchers', 'NativeWatcher.js'));
  });
}

const config = getDefaultConfig(__dirname);

// Exclude build artifacts and temporary export directories from Metro's resolution
const additionalBlockList = [
  /^(?:dist|temp_export)[\\/].*$/,
];

if (Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList.push(...additionalBlockList);
} else if (config.resolver.blockList) {
  config.resolver.blockList = [config.resolver.blockList, ...additionalBlockList];
} else {
  config.resolver.blockList = additionalBlockList;
}

module.exports = config;
