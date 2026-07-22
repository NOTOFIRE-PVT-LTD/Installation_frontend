import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { tenderApi } from '../../api/tenderApi';
import TenderAccordion from '../../components/cadDrawing/TenderAccordion';

export default function ProjectCadDrawingTab({ project }) {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    tenderApi
      .list({ project: project._id, pageSize: 50 })
      .then(({ data }) => setTenders(data.data))
      .catch(() => setTenders([]))
      .finally(() => setLoading(false));
  }, [project]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (tenders.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No cad drawings linked to this project
      </Typography>
    );
  }

  return (
    <Box>
      {tenders.map((tender) => (
        <TenderAccordion key={tender._id} tender={tender} />
      ))}
    </Box>
  );
}
