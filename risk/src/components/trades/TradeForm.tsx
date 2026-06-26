import React, { useState, useEffect } from 'react';
import { Save, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useStore } from '../../store/useStore';
import { calculateLotSize, calculatePips } from '../../utils/calculations';
import type { Trade, TradeResult } from '../../types';

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  trade?: Trade | null;
  mode: 'add' | 'edit';
}

export const TradeForm: React.FC<TradeFormProps> = ({
  isOpen,
  onClose,
  trade,
  mode,
}) => {
  const { settings, symbols, addTrade, updateTrade } = useStore();

  // All numeric fields stored as strings so user can clear them
  const [formData, setFormData] = useState({
    symbol: 'XAUUSD',
    type: 'buy' as 'buy' | 'sell',
    lotSize: '0.01',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    takeProfit: '',
    result: 'win' as 'win' | 'loss' | 'breakeven',
    profitLoss: '',
    pips: '',
    fees: '',
    notes: '',
    duration: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLotCalculator, setShowLotCalculator] = useState(false);
  const [lotCalcCapital, setLotCalcCapital] = useState(String(settings?.initialCapital || 1000));
  const [lotCalcRisk, setLotCalcRisk] = useState(String(settings?.riskPerTrade || 1));
  const [lotCalcSL, setLotCalcSL] = useState('');

  const toStr = (v: number | undefined | null) => (v == null || v === 0) ? '' : String(v);

  useEffect(() => {
    if (trade && mode === 'edit') {
      setFormData({
        symbol: trade.symbol,
        type: trade.type,
        lotSize: toStr(trade.lotSize),
        entryPrice: toStr(trade.entryPrice),
        exitPrice: toStr(trade.exitPrice),
        stopLoss: toStr(trade.stopLoss),
        takeProfit: toStr(trade.takeProfit),
        result: trade.result,
        profitLoss: toStr(trade.profitLoss),
        pips: toStr(trade.pips),
        fees: toStr(trade.fees),
        notes: trade.notes,
        duration: toStr(trade.duration),
      });
    } else {
      setFormData({
        symbol: 'XAUUSD',
        type: 'buy',
        lotSize: '0.01',
        entryPrice: '',
        exitPrice: '',
        stopLoss: '',
        takeProfit: '',
        result: 'win',
        profitLoss: '',
        pips: '',
        fees: '',
        notes: '',
        duration: '',
      });
    }
    setErrors({});
  }, [trade, mode, isOpen]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.lotSize.trim()) e.lotSize = 'أدخل حجم اللوت';
    else if (parseFloat(formData.lotSize) <= 0) e.lotSize = 'حجم اللوت يجب أن يكون أكبر من 0';
    if (!formData.entryPrice.trim()) e.entryPrice = 'أدخل سعر الدخول';
    else if (parseFloat(formData.entryPrice) <= 0) e.entryPrice = 'سعر الدخول يجب أن يكون أكبر من 0';
    if (!formData.profitLoss.trim()) e.profitLoss = 'أدخل الربح أو الخسارة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCalculatePips = () => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    if (entry && exit) {
      const pips = calculatePips(formData.type, entry, exit);
      updateField('pips', String(Math.round(pips * 10) / 10));
    }
  };

  const handleCalculateLot = () => {
    const cap = parseFloat(lotCalcCapital);
    const risk = parseFloat(lotCalcRisk);
    const sl = parseFloat(lotCalcSL);
    if (cap && risk && sl) {
      const lot = calculateLotSize(cap, risk, sl);
      updateField('lotSize', String(lot));
      setShowLotCalculator(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numData = {
      symbol: formData.symbol,
      type: formData.type,
      lotSize: parseFloat(formData.lotSize) || 0,
      entryPrice: parseFloat(formData.entryPrice) || 0,
      exitPrice: parseFloat(formData.exitPrice) || 0,
      stopLoss: parseFloat(formData.stopLoss) || 0,
      takeProfit: parseFloat(formData.takeProfit) || 0,
      result: formData.result,
      profitLoss: parseFloat(formData.profitLoss) || 0,
      pips: parseFloat(formData.pips) || 0,
      fees: parseFloat(formData.fees) || 0,
      notes: formData.notes,
      duration: parseInt(formData.duration) || 0,
    };

    if (mode === 'add') {
      addTrade(numData);
    } else if (trade) {
      updateTrade(trade.id, numData);
    }

    onClose();
  };

  const plValue = parseFloat(formData.profitLoss);
  const plClass = plValue > 0 ? 'border-success-500' : plValue < 0 ? 'border-danger-500' : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'إضافة صفقة جديدة' : 'تعديل الصفقة'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Symbol, Type, Lot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="الرمز"
            value={formData.symbol}
            onChange={(e) => updateField('symbol', e.target.value)}
            options={symbols.map(s => ({ value: s.name, label: s.name }))}
            required
          />
          <Select
            label="نوع الصفقة"
            value={formData.type}
            onChange={(e) => updateField('type', e.target.value)}
            options={[
              { value: 'buy', label: 'شراء' },
              { value: 'sell', label: 'بيع' },
            ]}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              حجم اللوت <span className="text-danger-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={formData.lotSize}
                onChange={(e) => updateField('lotSize', e.target.value)}
                error={errors.lotSize}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowLotCalculator(true)}
                icon={<Calculator className="w-4 h-4" />}
              >
                حساب
              </Button>
            </div>
          </div>
        </div>

        {/* Row 2: Prices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="سعر الدخول"
            type="number"
            step="any"
            value={formData.entryPrice}
            onChange={(e) => updateField('entryPrice', e.target.value)}
            error={errors.entryPrice}
          />
          <Input
            label="سعر الخروج"
            type="number"
            step="any"
            value={formData.exitPrice}
            onChange={(e) => updateField('exitPrice', e.target.value)}
          />
          <Input
            label="وقف الخسارة"
            type="number"
            step="any"
            value={formData.stopLoss}
            onChange={(e) => updateField('stopLoss', e.target.value)}
          />
          <Input
            label="جني الأرباح"
            type="number"
            step="any"
            value={formData.takeProfit}
            onChange={(e) => updateField('takeProfit', e.target.value)}
          />
        </div>

        {/* Row 3: Result, P&L, Pips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="نتيجة الصفقة"
            value={formData.result}
            onChange={(e) => updateField('result', e.target.value)}
            options={[
              { value: 'win', label: 'رابحة' },
              { value: 'loss', label: 'خاسرة' },
              { value: 'breakeven', label: 'تعادل' },
            ]}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              الربح/الخسارة (USD) <span className="text-danger-500">*</span>
            </label>
            <Input
              type="number"
              step="any"
              value={formData.profitLoss}
              onChange={(e) => updateField('profitLoss', e.target.value)}
              error={errors.profitLoss}
              className={plClass}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              النقاط
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="any"
                value={formData.pips}
                onChange={(e) => updateField('pips', e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCalculatePips}
              >
                حساب
              </Button>
            </div>
          </div>
        </div>

        {/* Row 4: Fees, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="الرسوم"
            type="number"
            step="any"
            value={formData.fees}
            onChange={(e) => updateField('fees', e.target.value)}
          />
          <Input
            label="مدة الصفقة (دقائق)"
            type="number"
            value={formData.duration}
            onChange={(e) => updateField('duration', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ملاحظات الصفقة
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-4 py-2.5 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="سبب الدخول، الأخطاء، ملاحظات..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" icon={<Save className="w-4 h-4" />}>
            {mode === 'add' ? 'حفظ الصفقة' : 'تحديث الصفقة'}
          </Button>
        </div>
      </form>

      {/* Lot Calculator Modal */}
      <Modal
        isOpen={showLotCalculator}
        onClose={() => setShowLotCalculator(false)}
        title="حاسبة اللوت"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="رأس المال"
            type="number"
            value={lotCalcCapital}
            onChange={(e) => setLotCalcCapital(e.target.value)}
          />
          <Input
            label="نسبة المخاطرة (%)"
            type="number"
            value={lotCalcRisk}
            onChange={(e) => setLotCalcRisk(e.target.value)}
          />
          <Input
            label="نقاط وقف الخسارة"
            type="number"
            value={lotCalcSL}
            onChange={(e) => setLotCalcSL(e.target.value)}
          />
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">اللوت المقترح</p>
            <p className="text-2xl font-bold text-primary-600">
              {lotCalcCapital && lotCalcRisk && lotCalcSL
                ? calculateLotSize(parseFloat(lotCalcCapital), parseFloat(lotCalcRisk), parseFloat(lotCalcSL))
                : '0.00'}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowLotCalculator(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCalculateLot}>
              تطبيق
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};
