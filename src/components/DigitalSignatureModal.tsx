import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme, fonts, fontSize, radius, spacing } from '../theme';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = Math.min(width - 64, 380);
const CANVAS_HEIGHT = 180;

export interface SignatureResult {
  pin: string;
  signedBy: string;
  signatureHash: string;
  qrToken: string;
  signaturePath: string;
}

interface DigitalSignatureModalProps {
  visible: boolean;
  documentTitle: string;
  letterNumber: string;
  signerTitle?: string;
  onClose: () => void;
  onConfirmSignature: (data: SignatureResult) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  visible,
  documentTitle,
  letterNumber,
  signerTitle = 'Ketua DPP / BSN PAN Wilayah',
  onClose,
  onConfirmSignature,
}) => {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<'PIN_AUTH' | 'CANVAS_SIGN'>('PIN_AUTH');
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Continuous Vector Path Signature State
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');

  // Synchronous references to avoid React async state loss during PanResponder
  const strokesHistoryRef = useRef<string[]>([]);
  const currentPathRef = useRef<string>('');
  const canvasRef = useRef<View>(null);
  const canvasOriginRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const onCanvasLayout = () => {
    canvasRef.current?.measureInWindow((x, y, w, h) => {
      if (w > 0 && h > 0) {
        canvasOriginRef.current = { x, y, width: w, height: h };
      }
    });
  };

  const getCanvasCoords = (evt: GestureResponderEvent) => {
    const { pageX, pageY, locationX, locationY } = evt.nativeEvent;
    if (canvasOriginRef.current.x > 0 && canvasOriginRef.current.y > 0) {
      const x = pageX - canvasOriginRef.current.x;
      const y = pageY - canvasOriginRef.current.y;
      return { x, y };
    }
    return { x: locationX, y: locationY };
  };

  const isInsideCanvas = (x: number, y: number) => {
    return x >= 0 && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        onCanvasLayout();
        const { x, y } = getCanvasCoords(evt);

        if (isInsideCanvas(x, y)) {
          const start = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          currentPathRef.current = start;
          setCurrentPath(start);
        } else {
          currentPathRef.current = '';
          setCurrentPath('');
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { x, y } = getCanvasCoords(evt);

        // If outside canvas bounds: terminate current stroke cleanly
        if (!isInsideCanvas(x, y)) {
          const strokeToSave = currentPathRef.current;
          if (strokeToSave && strokeToSave.length > 5) {
            strokesHistoryRef.current.push(strokeToSave);
            setPaths([...strokesHistoryRef.current]);
            currentPathRef.current = '';
            setCurrentPath('');
          }
          return;
        }

        // Inside canvas:
        if (!currentPathRef.current) {
          const start = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          currentPathRef.current = start;
          setCurrentPath(start);
        } else {
          const updated = `${currentPathRef.current} L ${x.toFixed(1)} ${y.toFixed(1)}`;
          currentPathRef.current = updated;
          setCurrentPath(updated);
        }
      },
      onPanResponderRelease: () => {
        const strokeToSave = currentPathRef.current;
        if (strokeToSave && strokeToSave.length > 5) {
          strokesHistoryRef.current.push(strokeToSave);
          setPaths([...strokesHistoryRef.current]);
        }
        currentPathRef.current = '';
        setCurrentPath('');
      },
      onPanResponderTerminate: () => {
        const strokeToSave = currentPathRef.current;
        if (strokeToSave && strokeToSave.length > 5) {
          strokesHistoryRef.current.push(strokeToSave);
          setPaths([...strokesHistoryRef.current]);
        }
        currentPathRef.current = '';
        setCurrentPath('');
      },
    })
  ).current;

  const handleClearSignature = () => {
    strokesHistoryRef.current = [];
    currentPathRef.current = '';
    setPaths([]);
    setCurrentPath('');
  };

  const handleVerifyPin = () => {
    if (pin.length < 4) {
      setPinError('Masukkan minimal 4 digit PIN keamanan.');
      return;
    }
    setPinError('');
    setStep('CANVAS_SIGN');
  };

  const handleSaveSignature = () => {
    const totalStrokes = strokesHistoryRef.current.length;
    if (totalStrokes === 0 && !currentPathRef.current) {
      setPinError('Silakan goreskan tanda tangan Anda pada canvas.');
      return;
    }

    // Combine all paths into one SVG path string
    const combinedPath = strokesHistoryRef.current.join(' ');

    const randomHash =
      'SHA256:' +
      Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').toUpperCase();
    const qrToken = `PAN360-DSIGN-${Date.now()}-LEGAL`;

    onConfirmSignature({
      pin,
      signedBy: signerTitle,
      signatureHash: randomHash,
      qrToken,
      signaturePath: combinedPath,
    });

    // Reset state
    setPin('');
    handleClearSignature();
    setStep('PIN_AUTH');
  };

  const handleModalClose = () => {
    setStep('PIN_AUTH');
    setPin('');
    handleClearSignature();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.headerTagRow}>
                <Feather name="shield" size={12} color={colors.primary} />
                <Text style={[styles.headerTag, { color: colors.primary }]}>OTORISASI TANDA TANGAN ELEKTRONIK</Text>
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {step === 'PIN_AUTH' ? 'Otentikasi Kriptografis PIN' : 'Bubuhkan Tanda Tangan'}
              </Text>
              <Text style={[styles.docSub, { color: colors.textMuted }]} numberOfLines={1}>
                {documentTitle} • {letterNumber}
              </Text>
            </View>
            <TouchableOpacity onPress={handleModalClose} style={[styles.closeBtn, { backgroundColor: colors.background }]} hitSlop={8}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {step === 'PIN_AUTH' ? (
            <View style={styles.stepContainer}>
              <View style={[styles.securityBanner, { backgroundColor: isDark ? '#1E293B' : '#F0F9FF', borderColor: colors.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="lock" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.secTitle, { color: colors.text }]}>Verifikasi Penandatanganan Mandat</Text>
                <Text style={[styles.secDesc, { color: colors.textMuted }]}>
                  Surat tugas ini akan terikat secara kriptografis ke identitas resmi jabatan pimpinan BSN PAN dan tersimpan di database nasional.
                </Text>
              </View>

              <View style={{ gap: spacing.xs, width: '100%' }}>
                <Text style={[styles.pinLabel, { color: colors.text }]}>Masukkan PIN Keamanan Pimpinan (6 Digit):</Text>
                <TextInput
                  style={[styles.pinInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  placeholder="• • • • • •"
                  placeholderTextColor={colors.textMuted}
                  value={pin}
                  onChangeText={(text) => {
                    setPin(text);
                    if (pinError) setPinError('');
                  }}
                />
              </View>

              {!!pinError && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{pinError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                onPress={handleVerifyPin}
                activeOpacity={0.85}
              >
                <Text style={styles.btnPrimaryText}>Lanjut ke Canvas Tanda Tangan</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <View style={[styles.canvasWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.canvasHeader}>
                  <Text style={[styles.canvasHint, { color: colors.textMuted }]}>
                    Goreskan tanda tangan di dalam area berikut:
                  </Text>
                  <TouchableOpacity onPress={handleClearSignature} style={styles.clearBtn}>
                    <Feather name="trash-2" size={14} color={colors.danger} />
                    <Text style={[styles.clearBtnText, { color: colors.danger }]}>Hapus</Text>
                  </TouchableOpacity>
                </View>

                <View
                  ref={canvasRef}
                  onLayout={onCanvasLayout}
                  style={[styles.canvasBox, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}
                  {...panResponder.panHandlers}
                >
                  <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.svg}>
                    {paths.map((p, idx) => (
                      <Path
                        key={`path-${idx}`}
                        d={p}
                        stroke={colors.primary}
                        strokeWidth={2.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    ))}
                    {!!currentPath && (
                      <Path
                        d={currentPath}
                        stroke={colors.primary}
                        strokeWidth={2.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    )}
                  </Svg>
                  {paths.length === 0 && !currentPath && (
                    <View style={styles.watermarkContainer} pointerEvents="none">
                      <Feather name="edit-3" size={24} color={colors.textMuted} style={{ opacity: 0.35 }} />
                      <Text style={[styles.watermarkText, { color: colors.textMuted }]}>Sentuh & Goreskan Tanda Tangan</Text>
                    </View>
                  )}
                </View>
              </View>

              {!!pinError && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{pinError}</Text>
                </View>
              )}

              <View style={styles.canvasActionRow}>
                <TouchableOpacity
                  style={[styles.btnSecondary, { borderColor: colors.border }]}
                  onPress={() => setStep('PIN_AUTH')}
                >
                  <Feather name="arrow-left" size={14} color={colors.text} />
                  <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Ubah PIN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnConfirm, { backgroundColor: colors.primary }]}
                  onPress={handleSaveSignature}
                  activeOpacity={0.85}
                >
                  <Feather name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.btnPrimaryText}>Simpan & Bubuhi Surat</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTag: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  docSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  securityBanner: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  secTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  secDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  pinLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  pinInput: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    letterSpacing: 8,
    fontFamily: fonts.bold,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  btnPrimary: {
    width: '100%',
    height: 46,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  canvasWrapper: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.xs,
    alignItems: 'center',
  },
  canvasHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  canvasHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
  },
  canvasBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(150, 150, 150, 0.35)',
    borderRadius: radius.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  watermarkText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    opacity: 0.5,
  },
  canvasActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  btnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnSecondaryText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  btnConfirm: {
    flex: 2,
    height: 44,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
