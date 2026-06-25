import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useStore } from '../../store/useStore';
import { calculateLotSize, calculatePips } from '../../utils/calculations';
import type { Trade, TradeFormData, TradeResult } from '../../types';

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

  const [formData, setFormData] = useState<TradeFormData>({
    symbol: 'XAUUSD',
    type: 'buy',
    lotSize: 0.01,
    entryPrice: 0,
    exitPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    result: 'win',
    profitLoss: 0,
    pips: 0,
    fees: 0,
    notes: '',
    duration: 0,
  });

  const [showLotCalculator, setShowLotCalculator] = useState(false);
  const [lotCalcCapital, setLotCalcCapital] = useState(settings?.initialCapital || 1000);
  const [lotCalcRisk, setLotCalcRisk] = useState(settings?.riskPerTrade || 1);
  const [lotCalcSL, setLotCalcSL] = useState(0);

  useEffect(() => {
    if (trade && mode === 'edit') {
      setFormData({
        symbol: trade.symbol,
        type: trade.type,
        lotSize: trade.lotSize,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        result: trade.result,
        profitLoss: trade.profitLoss,
        pips: trade.pips,
        fees: trade.fees,
        notes: trade.notes,
        duration: trade.duration,
      });
    } else {
      setFormData({
        symbol: 'XAUUSD',
        type: 'buy',
        lotSize: 0.01,
        entryPrice: 0,
        exitPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        result: 'win',
        profitLoss: 0,
        pips: 0,
        fees: 0,
        notes: '',
        duration: 0,
      });
    }
  }, [trade, mode, isOpen]);

  const updateField = (field: keyof TradeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculatePips = () => {
    if (formData.entryPrice && formData.exitPrice) {
      const pips = calculatePips(formData.type, formData.entryPrice, formData.exitPrice);
      updateField('pips', Math.round(pips * 10) / 10);
    }
  };

  const handleCalculateLot = () => {
    if (lotCalcCapital && lotCalcRisk && lotCalcSL) {
      const lot = calculateLotSize(lotCalcCapital, lotCalcRisk, lotCalcSL);
      updateField('lotSize', lot);
      setShowLotCalculator(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'add') {
      addTrade(formData);
    } else if (trade) {
      updateTrade(trade.id, formData);
    }
    
    onClose();
  };

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
                onChange={(e) => updateField('lotSize', parseFloat(e.target.value) || 0)}
                required
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
            value={formData.entryPrice || ''}
            onChange={(e) => updateField('entryPrice', parseFloat(e.target.value) || 0)}
          />
          <Input
            label="سعر الخروج"
            type="number"
            step="any"
            value={formData.exitPrice || ''}
            onChange={(e) => updateField('exitPrice', parseFloat(e.target.value) || 0)}
          />
          <Input
            label="وقف الخسارة"
            type="number"
            step="any"
            value={formData.stopLoss || ''}
            onChange={(e) => updateField('stopLoss', parseFloat(e.target.value) || 0)}
          />
          <Input
            label="جني الأرباح"
            type="number"
            step="any"
            value={formData.takeProfit || ''}
            onChange={(e) => updateField('takeProfit', parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Row 3: Result, P&L, Pips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="نتيجة الصفقة"
            value={formData.result}
            onChange={(e) => updateField('result', e.target.value as TradeResult)}
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
              onChange={(e) => updateField('profitLoss', parseFloat(e.target.value) || 0)}
              className={formData.profitLoss > 0 ? 'border-success-500' : formData.profitLoss < 0 ? 'border-danger-500' : ''}
              required
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
                onChange={(e) => updateField('pips', parseFloat(e.target.value) || 0)}
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
            value={formData.fees || ''}
            onChange={(e) => updateField('fees', parseFloat(e.target.value) || 0)}
          />
          <Input
            label="مدة الصفقة (دقائق)"
            type="number"
            value={formData.duration || ''}
            onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
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
            onChange={(e) => setLotCalcCapital(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="نسبة المخاطرة (%)"
            type="number"
            value={lotCalcRisk}
            onChange={(e) => setLotCalcRisk(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="نقاط وقف الخسارة"
            type="number"
            value={lotCalcSL}
            onChange={(e) => setLotCalcSL(parseFloat(e.target.value) || 0)}
          />
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">اللوت المقترح</p>
            <p className="text-2xl font-bold text-primary-600">
              {lotCalcCapital && lotCalcRisk && lotCalcSL
                ? calculateLotSize(lotCalcCapital, lotCalcRisk, lotCalcSL)
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
