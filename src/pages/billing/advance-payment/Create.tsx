import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import {
  nowIso,
  upsertApplication,
  type SyncedApplication,
} from '@/pages/vendor/common/prepaidApplicationSync';
import { history } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Result,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import styles from './index.less';
import {
  RESPONSIBLE_DEPARTMENTS,
  PAYMENT_DEFINITIONS,
  ENTITIES,
  BUSINESS_UNITS,
  PAYMENT_ID_L1,
  PAYMENT_ID_L2,
  VENDORS,
  VENDOR_BANK_INFOS,
  type BankInfoEntry,
} from './mock/applicationData';
import { CANDIDATE_WAYBILLS } from './mock/waybills';

interface FormWaybill {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  basicAmount: number;
  prePaidAmount: number;
}

function genApplicationNo(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `PPA${yy}${mm}${dd}${String(Math.floor(Math.random() * 900) + 100)}`;
}

function genRfpNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `RFP-${yy}${mm}${dd}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

const AdvancePaymentCreate: React.FC = () => {
  const [applicationNo] = useState(genApplicationNo);
  const [createdAt] = useState(() => new Date().toISOString());
  const [rfpNumber] = useState(genRfpNumber);

  // Basic Information
  const [vendor, setVendor] = useState('');
  const [responsibleDepartment, setResponsibleDepartment] = useState('');
  const [paymentDefinition, setPaymentDefinition] = useState('');
  const [entity, setEntity] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');
  const [dateOfNeeded, setDateOfNeeded] = useState('');
  const [paymentIdentificationL1, setPaymentIdentificationL1] = useState('');
  const [paymentIdentificationL2, setPaymentIdentificationL2] = useState('');

  // Waybills
  const [waybills, setWaybills] = useState<FormWaybill[]>([]);
  const [showAddWaybill, setShowAddWaybill] = useState(false);
  const [pickedCandidates, setPickedCandidates] = useState<Set<string>>(new Set());

  // Bank Information
  const [bankInfos, setBankInfos] = useState<BankInfoEntry[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', proof: '' });

  // Supporting Documents & Remark
  const [proofFiles, setProofFiles] = useState<string[]>([]);
  const [remark, setRemark] = useState('');

  const [validationError, setValidationError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalAmountPayable = useMemo(
    () => waybills.reduce((s, w) => s + (Number(w.prePaidAmount) || 0), 0),
    [waybills],
  );

  // Switching vendor resets vendor-scoped selections
  const handleVendorChange = (v: string) => {
    setVendor(v);
    setWaybills([]);
    setBankInfos(VENDOR_BANK_INFOS[v] ? [...VENDOR_BANK_INFOS[v]] : []);
    setSelectedBankId('');
    setValidationError('');
  };

  const availableCandidates = CANDIDATE_WAYBILLS.filter(
    (c) => c.vendor === vendor && !waybills.find((w) => w.no === c.no),
  );

  const updateWaybillAmount = (no: string, value: number) => {
    setWaybills((prev) => prev.map((w) => w.no === no ? { ...w, prePaidAmount: value } : w));
  };

  const removeWaybill = (no: string) => {
    setWaybills((prev) => prev.filter((w) => w.no !== no));
  };

  const handleAddWaybills = () => {
    const toAdd: FormWaybill[] = availableCandidates
      .filter((c) => pickedCandidates.has(c.no))
      .map((c) => ({
        no: c.no, positionTime: c.positionTime, unloadingTime: c.unloadingTime,
        truckType: c.truckType, origin: c.origin, destination: c.destination,
        basicAmount: c.basicAmount, prePaidAmount: 0,
      }));
    if (toAdd.length === 0) { setShowAddWaybill(false); return; }
    setWaybills((prev) => [...prev, ...toAdd]);
    setPickedCandidates(new Set());
    setShowAddWaybill(false);
    message.success(`${toAdd.length} waybill(s) added`);
  };

  // Bank helpers
  const handleAddBankInfo = () => {
    const next: BankInfoEntry = {
      id: `bank-${Date.now()}`,
      bankName: bankForm.bankName.trim(),
      accountName: bankForm.accountName.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      proof: bankForm.proof.trim(),
    };
    setBankInfos((prev) => [next, ...prev]);
    setSelectedBankId(next.id);
    setBankForm({ bankName: '', accountName: '', accountNumber: '', proof: '' });
    setShowAddBank(false);
    message.success('Payment account added');
  };

  // Submit
  const validate = (): string => {
    if (!vendor) return 'Please select a vendor.';
    if (!responsibleDepartment) return 'Please select a Responsible Department.';
    if (!paymentDefinition) return 'Please select a Payment Definition.';
    if (!entity) return 'Please select an Entity.';
    if (!businessUnit) return 'Please select a Business Unit.';
    if (!dateOfNeeded) return 'Please select a Date of Needed.';
    if (!paymentIdentificationL1) return 'Please select a Payment Identification L1.';
    if (!paymentIdentificationL2) return 'Please select a Payment Identification L2.';
    if (waybills.length === 0) return 'Please add at least one waybill.';
    if (waybills.some((w) => w.prePaidAmount <= 0)) return 'Each waybill must have an Advance Payment greater than 0.';
    if (!selectedBankId) return 'Please select a Payment Account entry.';
    return '';
  };

  const isReadyToCreateRfp = !validate();

  const handleSubmit = () => {
    const err = validate();
    if (err) { setValidationError(err); return; }
    const selectedBank = bankInfos.find((entry) => entry.id === selectedBankId);
    const now = nowIso();
    const app: SyncedApplication = {
      applicationNo, vendorName: vendor, source: 'Internal',
      appType: 'Advance Payment Request', status: 'Pending Payment',
      taxMark: 'VAT-ex', currency: 'PHP', rfpNumber,
      responsibleDepartment, paymentDefinition, entity, businessUnit,
      dateOfNeeded, paymentIdentificationL1, paymentIdentificationL2,
      waybills: waybills.map((w) => ({
        no: w.no, positionTime: w.positionTime, unloadingTime: w.unloadingTime,
        truckType: w.truckType, origin: w.origin, destination: w.destination,
        prePaidAmount: w.prePaidAmount,
      })),
      claimTickets: [],
      paymentItems: [{ type: 'Basic Amount', netAmount: totalAmountPayable, vatRate: 0, vatAmount: 0, whtRate: 0, whtAmount: 0 }],
      deductionItems: [],
      totalAmountPayable,
      payeeType: 'External Vendor', payeeName: vendor,
      bankName: selectedBank?.bankName, payeeAccount: selectedBank?.accountNumber,
      bankProof: selectedBank?.proof,
      proofFiles, remark, createdAt, submittedAt: now, reviewedAt: now,
      operationLogs: [{ time: now, actor: 'TMS User', action: 'Created Advance Payment Request', note: 'Request created directly as Pending Payment' }],
    };
    upsertApplication(app);
    setValidationError('');
    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <div className={styles.successCard}>
        <Result
          status="success"
          title="Request Created"
          subTitle={<>The advance payment request <strong>{applicationNo}</strong> has been created and is now <strong>Pending Payment</strong>.</>}
          extra={<Button type="primary" onClick={() => history.push(PATHS.BILLING_ADVANCE_PAYMENT)}>Back to List</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <BreadcrumbCase
        items={[
          { name: 'Advance Payment', path: PATHS.BILLING_ADVANCE_PAYMENT },
          { name: 'Create Request', path: PATHS.BILLING_ADVANCE_PAYMENT_CREATE },
        ]}
      />

      {/* Header bar */}
      <div className={styles.createFormHeader}>
        <Typography.Text strong>{applicationNo}</Typography.Text>
        <Tag>Internal</Tag>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          onClick={handleSubmit}
          disabled={!isReadyToCreateRfp}
        >
          Confirm and Create RFP
        </Button>
      </div>

      {/* Basic Information */}
      <Card className={styles.createFormSection}>
        <div className={styles.sectionTitle}>Basic Information</div>
        {/* Row 1 */}
        <div className={styles.formGrid} style={{ marginBottom: 16 }}>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Vendor</div>
            <Select style={{ width: '100%' }} value={vendor || undefined} placeholder="Select Vendor" onChange={handleVendorChange}>
              {VENDORS.map((v) => <Select.Option key={v} value={v}>{v}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className={styles.formLabel}>Creator</div>
            <div>Zhang Jialei</div>
          </div>
          <div>
            <div className={styles.formLabel}>Total Amount Payable</div>
            <div style={{ fontWeight: 600 }}>{fmt(totalAmountPayable)}</div>
          </div>
          <div>
            <div className={styles.formLabel}>Create date</div>
            <div>{createdAt.slice(0, 10)}</div>
          </div>
        </div>
        {/* Row 2 - RFP fields */}
        <div className={styles.formGrid} style={{ marginBottom: 16 }}>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Responsible Department</div>
            <Select style={{ width: '100%' }} value={responsibleDepartment || undefined} placeholder="Select" onChange={setResponsibleDepartment}>
              {RESPONSIBLE_DEPARTMENTS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Payment Definition</div>
            <Select style={{ width: '100%' }} value={paymentDefinition || undefined} placeholder="Select" onChange={setPaymentDefinition}>
              {PAYMENT_DEFINITIONS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Entity</div>
            <Select style={{ width: '100%' }} value={entity || undefined} placeholder="Select" onChange={setEntity}>
              {ENTITIES.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Business Unit</div>
            <Select style={{ width: '100%' }} value={businessUnit || undefined} placeholder="Select" onChange={setBusinessUnit}>
              {BUSINESS_UNITS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </div>
        </div>
        {/* Row 3 */}
        <div className={styles.formGrid}>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Date of Needed</div>
            <Input type="date" style={{ width: '100%' }} value={dateOfNeeded} onChange={(e) => setDateOfNeeded(e.target.value)} />
          </div>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Payment Identification L1</div>
            <Select style={{ width: '100%' }} value={paymentIdentificationL1 || undefined} placeholder="Select" onChange={setPaymentIdentificationL1}>
              {PAYMENT_ID_L1.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className={styles.formLabel}><span style={{ color: '#ff4d4f' }}>* </span>Payment Identification L2</div>
            <Select style={{ width: '100%' }} value={paymentIdentificationL2 || undefined} placeholder="Select" onChange={setPaymentIdentificationL2}>
              {PAYMENT_ID_L2.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </div>
        </div>
      </Card>

      {/* Advance Payment Waybills */}
      <Card className={styles.createFormSection}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Advance Payment Waybills ({waybills.length})</div>
          <div style={{ flex: 1 }} />
          <Button onClick={() => setShowAddWaybill(true)} disabled={!vendor} title={!vendor ? 'Please select a vendor first' : undefined}>
            + Add Waybill
          </Button>
        </div>

        {waybills.length === 0 ? (
          <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 24 }}>
            {vendor ? 'No waybills added yet. Click "Add Waybill" to start.' : 'Select a vendor first, then add waybills.'}
          </Typography.Text>
        ) : (
          <Table size="small" pagination={false} dataSource={waybills} rowKey="no" columns={[
            { title: 'Waybill', dataIndex: 'no', render: (v: string) => <strong>{v}</strong> },
            { title: 'Position Time', dataIndex: 'positionTime' },
            { title: 'Unloading Time', dataIndex: 'unloadingTime' },
            { title: 'Truck Type', dataIndex: 'truckType' },
            { title: 'Origin', dataIndex: 'origin', render: (v: string) => v || '-' },
            { title: 'Destination', dataIndex: 'destination', render: (v: string) => v || '-' },
            { title: 'Basic Amount', dataIndex: 'basicAmount', align: 'right' as const, render: (v: number) => fmt(v) },
            {
              title: 'Advance Payment', align: 'right' as const,
              render: (_: any, record: FormWaybill) => (
                <InputNumber
                  size="small"
                  style={{ width: 110 }}
                  value={record.prePaidAmount === 0 ? undefined : record.prePaidAmount}
                  placeholder="0.00"
                  onChange={(val) => updateWaybillAmount(record.no, val || 0)}
                />
              ),
            },
            {
              title: 'Prepayment Ratio', align: 'right' as const,
              render: (_: any, record: FormWaybill) => {
                const ratio = record.basicAmount > 0 ? (record.prePaidAmount / record.basicAmount) : 0;
                return (
                  <span style={{
                    color: ratio > 0.5 ? '#cf1322' : 'var(--character-title-65)',
                    fontWeight: ratio > 0.5 ? 600 : undefined,
                  }}>
                    {record.basicAmount > 0 ? `${(ratio * 100).toFixed(2)}%` : '-'}
                  </span>
                );
              },
            },
            {
              title: 'Actions',
              render: (_: any, record: FormWaybill) => (
                <Button type="link" danger size="small" onClick={() => removeWaybill(record.no)}>Remove</Button>
              ),
            },
          ]} />
        )}
        <div className={styles.totalBar}>
          <span className={styles.totalLabel}>Total Advance Payment Amount</span>
          <span className={styles.totalValue}>{fmt(totalAmountPayable)}</span>
        </div>
      </Card>

      {/* Payment Account */}
      <Card className={styles.createFormSection}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Payment Account</div>
          <div style={{ flex: 1 }} />
          <Button onClick={() => setShowAddBank(true)} disabled={!vendor}>+ Add Payment Account</Button>
        </div>
        {bankInfos.length === 0 ? (
          <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 24 }}>
            {vendor ? 'No payment accounts registered. Click "Add Payment Account".' : 'Select a vendor first to load payment accounts.'}
          </Typography.Text>
        ) : (
          <div className={styles.bankGrid}>
            {bankInfos.map((entry) => {
              const selected = selectedBankId === entry.id;
              return (
                <div key={entry.id} className={`${styles.bankCard} ${selected ? styles.selected : ''}`} onClick={() => setSelectedBankId(entry.id)}>
                  <Radio checked={selected} />
                  <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                    <div>
                      <div className={styles.infoLabel}>Bank Name</div>
                      <div style={{ fontWeight: 600 }}>{entry.bankName}</div>
                    </div>
                    <div>
                      <div className={styles.infoLabel}>Bank Account Name</div>
                      <div>{entry.accountName}</div>
                    </div>
                    <div>
                      <div className={styles.infoLabel}>Bank Account Number</div>
                      <div>{entry.accountNumber}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Supporting Documents */}
      <Card className={styles.createFormSection}>
        <div className={styles.sectionTitle}>Supporting Documents</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {proofFiles.map((f, i) => (
            <div key={i} className={styles.proofTile}>
              <div style={{ fontSize: 24 }}>&#128196;</div>
              <div style={{ maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</div>
              <button className={styles.proofTileRemove} onClick={() => setProofFiles((prev) => prev.filter((_, j) => j !== i))}>x</button>
            </div>
          ))}
          <button className={styles.proofTileAdd} onClick={() => setProofFiles((prev) => [...prev, `proof_${prev.length + 1}.pdf`])}>+</button>
        </div>
      </Card>

      {/* Remark */}
      <Card className={styles.createFormSection}>
        <div className={styles.sectionTitle}>Remark</div>
        <Input.TextArea
          rows={4}
          placeholder="Optional - add any notes for the reviewer."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </Card>

      {/* Validation error */}
      {validationError && (
        <Alert type="error" message={validationError} showIcon style={{ marginBottom: 12 }} />
      )}

      {/* Add Waybill Modal */}
      <Modal
        title="Add Waybill(s)"
        open={showAddWaybill}
        onCancel={() => { setShowAddWaybill(false); setPickedCandidates(new Set()); }}
        onOk={handleAddWaybills}
        okText={`Add${pickedCandidates.size > 0 ? ` (${pickedCandidates.size})` : ''}`}
        okButtonProps={{ disabled: pickedCandidates.size === 0 }}
        width={720}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Only waybills of <strong>{vendor}</strong> with status Planning, Pending, or In Transit are eligible.
        </Typography.Text>
        {availableCandidates.length === 0 ? (
          <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 24 }}>No more eligible waybills.</Typography.Text>
        ) : (
          <Table
            size="small"
            pagination={false}
            dataSource={availableCandidates}
            rowKey="no"
            rowSelection={{
              selectedRowKeys: [...pickedCandidates],
              onChange: (keys) => setPickedCandidates(new Set(keys as string[])),
            }}
            columns={[
              { title: 'Waybill', dataIndex: 'no', render: (v: string) => <strong>{v}</strong> },
              { title: 'Status', dataIndex: 'status' },
              { title: 'Truck Type', dataIndex: 'truckType' },
              { title: 'Origin', dataIndex: 'origin' },
              { title: 'Destination', dataIndex: 'destination' },
            ]}
          />
        )}
      </Modal>

      {/* Add Payment Account Modal */}
      <Modal
        title="Add Payment Account"
        open={showAddBank}
        onCancel={() => { setShowAddBank(false); setBankForm({ bankName: '', accountName: '', accountNumber: '', proof: '' }); }}
        onOk={handleAddBankInfo}
        okText="Add"
        okButtonProps={{ disabled: !bankForm.bankName.trim() || !bankForm.accountName.trim() || !bankForm.accountNumber.trim() || !bankForm.proof.trim() }}
        width={520}
      >
        <div style={{ display: 'grid', gap: 14, fontSize: 13 }}>
          {([
            ['Bank Name', 'bankName'],
            ['Bank Account Name', 'accountName'],
            ['Bank Account Number', 'accountNumber'],
            ['Proof', 'proof'],
          ] as [string, keyof typeof bankForm][]).map(([label, key]) => (
            <div key={key}>
              <div style={{ color: '#555', marginBottom: 4 }}>{label} <span style={{ color: '#ff4d4f' }}>*</span></div>
              <Input
                placeholder={key === 'proof' ? 'bank_proof.pdf' : undefined}
                value={bankForm[key]}
                onChange={(e) => setBankForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default AdvancePaymentCreate;
