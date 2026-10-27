/** File picker that opens the phone camera. Do not use the `hidden` attribute — iOS ignores capture then. */
export default function CameraFileInput({ capture = 'user', onFile }) {
  return (
    <input
      type="file"
      accept="image/*"
      capture={capture}
      onChange={(e) => {
        const file = e.target.files?.[0] || null;
        e.target.value = '';
        onFile?.(file);
      }}
      style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
    />
  );
}
