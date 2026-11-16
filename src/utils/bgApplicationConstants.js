import { jsPDF } from 'jspdf';
import { formatDate } from './formatters';
import { pdfText, dash, pdfCurrency, ensureSpace, safeFilePart } from './stationReportExport';
import { HDFC_LOGO_BASE64 } from '../assets/hdfcLogoBase64';

export const BG_TYPE_OPTIONS = ['Physical BG', 'FCY BG', 'e-BG', 'GEM BG'];

export const MARGIN = 10;
export const COL_GAP = 5;
export const SECTION_GAP = 4.2;
export const HEADER_BLUE = [15, 50, 120];
export const LABEL_COLOR = [71, 85, 105];
export const VALUE_COLOR = [15, 23, 42];
export const BOX_LINE = [180, 188, 198];
export const SECTION_BORDER = [190, 196, 204];

export const DECLARATION_ITEMS = [
  'i) I/We hereby authorise HDFC Bank Ltd to mark lien on Deposit accounts which are /will be kept as margin money against the Bank Guarantee.',
  'ii) I/We hereby agree and confirm that the above Bank Guarantee is subject to the terms and conditions as contained herein and in the sanction letter for the bank Guarantee entered into between the applicant and The Bank.',
  'iii) I/We, am/are fully aware that in the event of invocation of Bank Guarantee (BG) by beneficiary, HDFC Bank Ltd is entitled to make the payment immediately to the beneficiary by debiting my/our operative account (CC/OD/CA), notwithstanding any dispute that I/we might have with the beneficiary.',
  'iv) I/We hereby agree that margin money would be released by the Bank only on receipt of the Original Bank Guarantee along with discharge letter/ no claim letter from the Beneficiary.',
];
export const DECLARATION_ITEMS_AFTER_CLAIM = [
  'vi) In case said BG is issued with Continuing clause, we authorize the bank to keep guarantee active for a further period of six months from earlier expiry date on every subsequent expiry date till the time original guarantee (including all amendments) along with beneficiary discharge letter is submitted to the bank for cancellation.',
  'vii) In case of the said BG being issued on an auto renewal basis, I/We hereby authorize the Bank to debit My/Our account(s) with the Bank towards commission for renewal of the said BG.',
  'viii) In case said BG is having governing law as URDG 758, we understand the implications related to the same and authorising bank to issue the bank guarantee with governing rule as URDG 758. We also confirm that the underlying text of the BG has beneficiary consent.',
  'ix) In case said BG is issued in Foreign Currency with Foreign Jurisdiction Clause whether in bank guarantee or counter bank guarantee, we will indemnify bank against all cost/ charges/ damages/ expenses which bank may incur in contesting any legal proceeding before foreign court.',
  'x) I am/ We are aware that Bank is required to provide 1-year additional claim period over the expiry date or the claim period as mentioned in the Bank Guarantee, whichever is later as per law. Accordingly, Bank is liable to make payment to Beneficiary if the claim is made within the above additional claim period. Hence, I/we authorize the Bank to block/continue the limit and hold margin/security provided by us during the additional claim period',
  'xi) I/We further confirm that all the documents/fixed deposit/margin submitted/furnished by us for issuance of the Bank Guarantee in favor of the Bank will continue to be in force and effect and shall be binding on me/us till I/we submit the Original Bank Guarantee and discharge letter from the Beneficiary to the Bank for cancellation.',
  'xii) I/We acknowledge and agree that the Bank shall be entitled to recover the commission for the additional claim period by debiting my/our account.',
];
