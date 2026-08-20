import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBgApplicationById } from '../../features/bgApplications/bgApplicationsThunks';
import { clearCurrent } from '../../features/bgApplications/bgApplicationsSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadBgApplicationPdf } from '../../utils/bgApplicationExport';
import { HDFC_LOGO_BASE64 } from '../../assets/hdfcLogoBase64';

function Field({ label, value }) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ borderBottom: '1px solid #ccc', pb: 0.25, minHeight: 20, whiteSpace: 'pre-line' }}>
        {value || ' '}
      </Typography>
    </Box>
  );
}

function CheckedOption({ label, checked }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Box
        sx={{
          width: 14,
          height: 14,
          border: '1.5px solid #64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          lineHeight: 1,
        }}
      >
        {checked ? '✕' : ''}
      </Box>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

function SectionBox({ number, title, children }) {
  return (
    <Box sx={{ border: '1.5px solid #0f172a', p: 2, mb: 2.5 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        {number ? `${number}. ${title}` : title}
      </Typography>
      {children}
    </Box>
  );
}

const DECLARATION_ITEMS = [
  'i) I/We hereby authorise HDFC Bank Ltd to mark lien on Deposit accounts which are /will be kept as margin money against the Bank Guarantee.',
  'ii) I/We hereby agree and confirm that the above Bank Guarantee is subject to the terms and conditions as contained herein and in the sanction letter for the bank Guarantee entered into between the applicant and The Bank.',
  'iii) I /We, am/are fully aware that in the event of invocation of Bank Guarantee (BG) by beneficiary, HDFC Bank Ltd is entitled to make the payment immediately to the beneficiary by debiting my/our operative account (CC/OD/CA), notwithstanding any dispute that I/we might have with the beneficiary.',
  'iv) I/We hereby agree that margin money would be released by the Bank only on receipt of the Original Bank Guarantee along with discharge letter/ no claim letter from the Beneficiary.',
  'v) We hereby authorize you to debit our account number to make the payment immediately in case of receipt of any claim from the beneficiary. You are also authorised to debit our account with the interest towards delayed payment claimed by the beneficiary.',
  'vi) In case said BG is issued with Continuing clause, we authorize the bank to keep guarantee active for a further period of six months from earlier expiry date on every subsequent expiry date till the time original guarantee (including all amendments) along with beneficiary discharge letter is submitted to the bank for cancellation.',
  'vii) In case of the said BG being issued on an auto renewal basis, I/We hereby authorize the Bank to debit My/Our account(s) with the Bank towards commission for renewal of the said BG.',
  'viii) In case said BG is having governing law as URDG 758, we understand the implications related to the same and authorising bank to issue the bank guarantee with governing rule as URDG 758. We also confirm that the underlying text of the BG has beneficiary consent.',
  'ix) In case said BG is issued in Foreign Currency with Foreign Jurisdiction Clause whether in bank guarantee or counter bank guarantee, we will indemnify bank against all cost/ charges/ damages/ expenses which bank may incur in contesting any legal proceeding before foreign court.',
  'x) I am/ We are aware that Bank is required to provide 1-year additional claim period over the expiry date or the claim period as mentioned in the Bank Guarantee, whichever is later as per law. Accordingly, Bank is liable to make payment to Beneficiary if the claim is made within the above additional claim period. Hence, I/we authorize the Bank to block/continue the limit and hold margin/security provided by us during the additional claim period',
  'xi) I/We further confirm that all the documents/fixed deposit/margin submitted/furnished by us for issuance of the Bank Guarantee in favor of the Bank will continue to be in force and effect and shall be binding on me/us till I/we submit the Original Bank Guarantee and discharge letter from the Beneficiary to the Bank for cancellation.',
  'xii) I/We acknowledge and agree that the Bank shall be entitled to recover the commission for the additional claim period by debiting my/our account.',
];

export default function BgApplicationPrintPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const app = useAppSelector((state) => state.bgApplications.current);
  const status = useAppSelector((state) => state.bgApplications.currentStatus);

  useEffect(() => {
    dispatch(fetchBgApplicationById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (status === 'loading' || !app) {
    return (
      <Stack alignItems="center" sx={{ mt: 10 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>

      <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mb: 2 }} className="no-print">
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => downloadBgApplicationPdf(app)}>
          Download PDF
        </Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
      </Stack>

      <Box
        className="print-sheet"
        sx={{
          bgcolor: '#fff',
          maxWidth: 820,
          mx: 'auto',
          p: { xs: 3, sm: 5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box component="img" src={HDFC_LOGO_BASE64} alt="HDFC Bank" sx={{ height: 34, mb: 2 }} />
        <Typography variant="h5" fontWeight={800} textAlign="center" sx={{ mb: 2 }}>
          APPLICATION FOR BANK GUARANTEE
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Field label="Account number" value={app.accountNumber} />
        <Stack direction="row" spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Field label="Branch Code" value={app.branchCode} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Field label="Branch Name" value={app.branchName} />
          </Box>
        </Stack>

        <SectionBox number={1} title="Type of Application">
          <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
            <CheckedOption label="Fresh Issuance" checked={app.typeOfApplication === 'Fresh Issuance'} />
            <CheckedOption label="Amendment (Existing Guarantee Number)" checked={app.typeOfApplication === 'Amendment'} />
          </Stack>
          <Field label="Amendment (Existing Guarantee Number)" value={app.amendmentExistingGuaranteeNumber} />
        </SectionBox>

        <SectionBox number={2} title="Applicant Details">
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Name & Address" value={app.applicantNameAddress} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Contact Person Name & Mobile No." value={app.applicantContactPersonMobile} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="PAN No" value={app.applicantPan} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Date of Incorporation" value={formatDate(app.applicantDateOfIncorporation)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="LEI Code" value={app.applicantLeiCode} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Email ID" value={app.applicantEmail} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Registered Address" value={app.applicantRegisteredAddress} />
            </Box>
          </Stack>
        </SectionBox>

        <SectionBox number={3} title="Nature of Bank Guarantee">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, max-content))',
              columnGap: 4,
              rowGap: 1.25,
              justifyContent: 'start',
            }}
          >
            {['Financial Guarantee', 'Performance Guarantee', 'Deferred Payment Guarantee', 'Advance Payment Guarantee', 'Others'].map(
              (option) => (
                <CheckedOption key={option} label={option} checked={app.natureOfBankGuarantee === option} />
              )
            )}
          </Box>
        </SectionBox>

        <SectionBox number={4} title="Type of BG">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, max-content))',
              columnGap: 4,
              justifyContent: 'start',
            }}
          >
            {['Physical BG', 'FCY BG', 'e-BG', 'GEM BG'].map((option) => (
              <CheckedOption key={option} label={option} checked={app.typeOfBG === option} />
            ))}
          </Box>
        </SectionBox>

        <SectionBox number={5} title="Details of Bank Guarantee">
          <Field label="Purpose" value={app.purpose} />
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Amount (Rs/FCY) in figures" value={app.bgAmountFigures} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Amount (Rs/FCY) in words" value={app.bgAmountWords} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Expiry Date" value={formatDate(app.expiryDate)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field
                label="BG Tenor"
                value={`${String(app.bgTenorYears ?? 0).padStart(2, '0')} Year, ${String(app.bgTenorMonths ?? 0).padStart(2, '0')} Months`}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Claim Expiry Date" value={formatDate(app.claimExpiryDate)} />
            </Box>
          </Stack>
          {app.claimExpiryYear != null && Number(app.claimExpiryYear) > 0 && (
            <Typography sx={{ mt: 0.5, fontSize: '0.95rem', fontWeight: 600 }}>
              {Number(app.claimExpiryYear)} year
            </Typography>
          )}
        </SectionBox>

        <SectionBox number={6} title="Beneficiary Details">
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Name & Address" value={app.beneficiaryNameAddress} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Contact Person Name & Mobile No" value={app.beneficiaryContactPersonMobile} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="EMail ID" value={app.beneficiaryEmail} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="GST Number" value={app.beneficiaryGstNumber} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="PAN No" value={app.beneficiaryPan} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Date of Incorporation" value={formatDate(app.beneficiaryDateOfIncorporation)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="LEI Code" value={app.beneficiaryLeiCode} />
            </Box>
          </Stack>
          <Typography variant="caption" color="text.secondary" component="div">
            *If e-BG with NeSL, please provide UIN allotted to Beneficiary by NeSL
          </Typography>
        </SectionBox>

        <SectionBox number={7} title="Beneficiary Bank Details for SFMS">
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Name & Address" value={app.beneficiaryBankNameAddress} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="IFSC / SWIFT code" value={app.beneficiaryBankIfscSwift} />
            </Box>
          </Stack>
        </SectionBox>

        <SectionBox number={8} title="Advising Bank Details (if Advising Bank is other than Beneficiary Bank)">
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Name & Address" value={app.advisingBankNameAddress} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="IFSC / SWIFT code" value={app.advisingBankIfscSwift} />
            </Box>
          </Stack>
        </SectionBox>

        <SectionBox number={9} title="Margin Details">
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="FD No" value={app.marginFdNo} />
              <Field label="Amount" value={formatCurrency(app.marginFdAmount)} />
              <Field label="Other" value={app.marginOther} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                New FD
              </Typography>
              <Field label="Debit A/C" value={app.marginNewFdDebitAccount} />
              <Field label="Amount" value={formatCurrency(app.marginNewFdAmount)} />
            </Box>
          </Stack>
        </SectionBox>

        <SectionBox number={10} title="Instruction on Bank Charges">
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            "I/We agree to pay all applicable taxes, duties (including stamp duty), cesses, fees and charges for
            issuance of this Guarantee and consent that necessary deductions in this regard may be made from my/our
            account number"
          </Typography>
        </SectionBox>

        <SectionBox number={11} title="General Declaration">
          <Stack spacing={1.25} sx={{ mb: 1.5 }}>
            {DECLARATION_ITEMS.map((text, i) => (
              <Typography key={i} variant="body2" sx={{ fontSize: '0.8rem' }}>
                {text}
              </Typography>
            ))}
          </Stack>
          <Stack direction="row" spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Field label="Debit Account Number (for claims)" value={app.claimDebitAccountNumber} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Field label="Delayed Payment Interest %" value={`${app.delayedPaymentInterestPercent || 0}%`} />
            </Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 2 }}>
            <Box sx={{ width: 200 }}>
              <Field label="Date" value={formatDate(app.declarationDate)} />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">Authorized Signatory</Typography>
              <Typography variant="caption" color="text.secondary">
                (Stamp to be affixed by firm/ Company)
              </Typography>
            </Box>
          </Stack>
        </SectionBox>

        <SectionBox title="Details of documents enclosed: (please tick all that are relevant)">
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap rowGap={1}>
            <CheckedOption label="Contract/Agreement copy" checked={Boolean(app.documentsContractAgreementCopy)} />
            <CheckedOption label="Counter Guarantee" checked={Boolean(app.documentsCounterGuarantee)} />
            <CheckedOption label="Bank Guarantee Text" checked={Boolean(app.documentsBankGuaranteeText)} />
          </Stack>
          <Box sx={{ mt: 1 }}>
            <CheckedOption
              label={`Other documents if any, please specify ${app.otherDocumentsSpecify || ''}`}
              checked={Boolean(app.documentsOther)}
            />
          </Box>
        </SectionBox>

        <Typography variant="caption" color="text.secondary">
          *Please note that in case of e-BG, the stamp duty will be procured through NeSL
        </Typography>
      </Box>
    </Box>
  );
}
