import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AttendanceStatusCard from '../../components/attendance/AttendanceStatusCard';
import AttendanceSummaryChart from '../../components/attendance/AttendanceSummaryChart';
import CorrectionRequestDialog from '../../components/attendance/CorrectionRequestDialog';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import { fetchAttendance, fetchTodayAttendance } from '../../features/attendance/attendanceThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { ROLES } from '../../utils/constants';
import { readLocation } from '../../utils/readLocation';
import { attendanceApi } from '../../api/attendanceApi';
import { peopleApi } from '../../api/peopleApi';
import { ATTENDANCE_PHASE } from '../../utils/attendanceFormat';
import { ATTENDANCE_COLUMNS } from './attendanceColumns';
import AttendanceFilterBar from './AttendanceFilterBar';

export default function AttendancePage({ embedded = false }) {
  const dispatch = useAppDispatch();
  const { user, isSalesperson } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const { items, total, status, today } = useAppSelector((state) => state.attendance);
  const { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, queryParams } =
    useTableQueryParams({ filterKeys: ['salesperson', 'from', 'to', 'status'] });
  const [pending, setPending] = useState(false);
  const [punching, setPunching] = useState(false);
  const [unfinished, setUnfinished] = useState(null);
  const [punchPhoto, setPunchPhoto] = useState(null);
  const [summary, setSummary] = useState({ days: [], counts: {} });
  const [requestDay, setRequestDay] = useState(null);
  const [people, setPeople] = useState([]);

  const loadSummary = async () => {
    try {
      const { data } = await attendanceApi.summary();
      setSummary(data.data || { days: [], counts: {}, expectedMinutes: 540 });
    } catch {
      setSummary({ days: [], counts: {}, expectedMinutes: 540 });
    }
  };

  useEffect(() => {
    dispatch(fetchTodayAttendance());
    dispatch(fetchAttendance(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    if (isSalesperson) loadSummary();
  }, [isSalesperson]);

  useEffect(() => {
    if (!isAdmin) return;
    peopleApi.list({ pageSize: 100 }).then(({ data }) => setPeople(data.data || [])).catch(() => setPeople([]));
  }, [isAdmin]);

  const refreshAll = async () => {
    await Promise.all([
      dispatch(fetchTodayAttendance()),
      dispatch(fetchAttendance(queryParams)),
      isSalesperson ? loadSummary() : Promise.resolve(),
    ]);
  };

  const executePunch = async (kind, confirmUnfinished, selfie) => {
    const loc = await readLocation();
    if (loc.lat == null) throw new Error(loc.error || 'GPS location is required');
    const form = new FormData();
    form.append('kind', kind);
    form.append('lat', String(loc.lat));
    form.append('lng', String(loc.lng));
    if (loc.address) form.append('address', loc.address);
    if (confirmUnfinished) form.append('confirmUnfinished', 'true');
    form.append('photo', selfie);
    const { data } = await attendanceApi.punch(form);
    dispatch(showSnackbar({
      message: data.message || (kind === 'IN' ? 'Attendance marked. Your visit plan is now available.' : 'Punched out'),
    }));
    setUnfinished(null);
    setPunchPhoto(null);
    await refreshAll();
  };

  const punch = async (kind, confirmUnfinished = false, file) => {
    if (pending || punching) return;
    const selfie = file || punchPhoto;
    if (!selfie) {
      dispatch(showSnackbar({ message: 'Click picture first', severity: 'error' }));
      return;
    }
    setPunchPhoto(selfie);
    setPunching(true);
    try {
      await executePunch(kind, confirmUnfinished, selfie);
    } catch (err) {
      if (kind === 'OUT' && err.response?.status === 409) {
        setUnfinished(err.response.data.errors || []);
      } else {
        dispatch(showSnackbar({ message: err.response?.data?.message || err || 'Punch failed', severity: 'error' }));
      }
    } finally {
      setPunching(false);
    }
  };

  const submitCorrection = async (payload) => {
    setPending(true);
    try {
      await attendanceApi.requestCorrection(payload);
      dispatch(showSnackbar({ message: 'Submitted. Open Approvals to track status.' }));
      setRequestDay(null);
      refreshAll();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Could not submit correction', severity: 'error' }));
    } finally {
      setPending(false);
    }
  };

  const canCorrect = (day) =>
    isSalesperson && (day.phase === ATTENDANCE_PHASE.MISSING || day.phase === ATTENDANCE_PHASE.INCOMPLETE) && !day.pendingCorrectionId;

  return (
    <>
      {!embedded && <PageHeader title="Attendance" subtitle="Punch in, punch out, and review this working week. Separate from customer visits." />}
      {isSalesperson && (
        <>
          <AttendanceStatusCard today={today} punching={punching} onPunchIn={(file) => punch('IN', false, file)} onPunchOut={(file) => punch('OUT', false, file)} />
          <AttendanceSummaryChart days={summary.days || []} expectedMinutes={summary.expectedMinutes || 540} todayDate={summary.today} canCorrect={canCorrect} onRequestCorrection={setRequestDay} />
        </>
      )}
      {(isAdmin || !isSalesperson) && (
        <DataTable
          columns={isAdmin ? ATTENDANCE_COLUMNS : ATTENDANCE_COLUMNS.filter((c) => c.field !== 'salesperson')}
          rows={items}
          totalCount={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
          onSortChange={(model) => model && setSort(model.field, model.sort)}
          searchValue={search}
          onSearchChange={setSearch}
          loading={status === 'loading'}
          toolbarStart={isAdmin ? <AttendanceFilterBar filters={filters} setFilter={setFilter} people={people} /> : null}
        />
      )}
      <ConfirmDialog
        open={Boolean(unfinished)}
        title="Unfinished visits"
        message={unfinished?.length ? `These visits will stay open: ${unfinished.map((v) => `${v.plannedTime} ${v.purpose} (${v.status})`).join('; ')}` : ''}
        confirmLabel="Punch out anyway"
        onClose={() => setUnfinished(null)}
        onConfirm={() => punch('OUT', true)}
        loading={punching}
      />
      <CorrectionRequestDialog open={Boolean(requestDay)} day={requestDay} pending={pending} onClose={() => setRequestDay(null)} onSubmit={submitCorrection} />
    </>
  );
}
