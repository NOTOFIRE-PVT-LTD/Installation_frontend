/** Visually hidden — `hidden`/`display:none` blocks the camera on iOS. */
export default function CameraFileInput({ capture = 'user', onFile }) {
  return (
    <input
      type="file"
      accept="image/*"
      capture={capture}
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) onFile?.(file);
      }}
      style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
    />
  );
}
