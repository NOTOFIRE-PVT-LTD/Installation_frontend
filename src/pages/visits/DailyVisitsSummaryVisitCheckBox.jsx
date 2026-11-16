import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

export default function DailyVisitsSummaryVisitCheckBox({ title, titleColor, visit, kind, isMissed, onPhotoClick }) {
  const photoUrl = kind === 'in' ? visit.checkInPhotoUrl : visit.checkOutPhotoUrl;
  const at = kind === 'in' ? visit.checkInAt : visit.checkOutAt;
  const captionPrefix = kind === 'in' ? 'Check-in' : 'Check-out';

  return (
    <Box sx={{ flex: 1, p: 1.25, borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid', borderColor: '#E2E8F0' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: titleColor, display: 'block', mb: 0.5 }}>
        {title}
      </Typography>
      {at ? (
        <Stack direction="row" spacing={1.5} alignItems="center">
          {photoUrl ? (
            <Tooltip title="Click to view full photo">
              <Box
                component="img"
                src={photoUrl}
                alt={`${captionPrefix} Selfie`}
                onClick={() => onPhotoClick(photoUrl, `${captionPrefix} Photo: ${visit.customer?.companyName}`)}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '6px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'transform 0.15s ease',
                }}
              />
            </Tooltip>
          ) : null}
          <VisitCheckBoxTimeDetails visit={visit} kind={kind} />
        </Stack>
      ) : (
        <VisitCheckBoxEmpty kind={kind} isMissed={isMissed} hasCheckIn={Boolean(visit.checkInAt)} />
      )}
    </Box>
  );
}

function VisitCheckBoxTimeDetails({ visit, kind }) {
  const at = kind === 'in' ? visit.checkInAt : visit.checkOutAt;
  return (
    <div>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {kind === 'in' ? (
          <>
            {visit.checkInDistanceM != null ? `📍 ${visit.checkInDistanceM}m from site` : 'Location verified'}
            {visit.checkInAddress ? ` · ${visit.checkInAddress}` : ''}
          </>
        ) : (
          <>
            {visit.visitDurationMin != null ? `${visit.visitDurationMin} mins` : ''}
            {visit.travelKm != null ? ` · Travel: ${visit.travelKm} km` : ''}
          </>
        )}
      </Typography>
    </div>
  );
}

function VisitCheckBoxEmpty({ kind, isMissed, hasCheckIn }) {
  if (kind === 'in' && isMissed) {
    return (
      <Typography variant="caption" color="warning.main">
        Not checked in (Missed visit)
      </Typography>
    );
  }
  if (kind === 'in') {
    return (
      <Typography variant="caption" color="text.secondary">
        Not checked in yet
      </Typography>
    );
  }
  return (
    <Typography variant="caption" color="text.secondary">
      {hasCheckIn ? 'Meeting in progress…' : 'Pending visit execution'}
    </Typography>
  );
}