import React, { useState, useEffect } from 'react';
import { Tool } from '../../types';

interface CalculatorToolsProps {
  tool: Tool;
}

const CalculatorTools: React.FC<CalculatorToolsProps> = ({ tool }) => {
  const [result, setResult] = useState<string | number | null>(null);
  
  // Specific State
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  
  const [ageDob, setAgeDob] = useState('');
  
  const [emiPrincipal, setEmiPrincipal] = useState('');
  const [emiRate, setEmiRate] = useState('');
  const [emiTime, setEmiTime] = useState(''); // months
  
  const [gstAmount, setGstAmount] = useState('');
  const [gstRate, setGstRate] = useState('');

  // General scientific
  const [expression, setExpression] = useState('');

  useEffect(() => {
    setResult(null);
    setExpression('');
  }, [tool.id]);

  const calculate = () => {
    switch (tool.id) {
      case 'calc-bmi':
        if (bmiHeight && bmiWeight) {
          const h = parseFloat(bmiHeight) / 100; // cm to m
          const w = parseFloat(bmiWeight);
          const bmi = w / (h * h);
          let cat = '';
          if (bmi < 18.5) cat = 'Underweight';
          else if (bmi < 25) cat = 'Normal weight';
          else if (bmi < 30) cat = 'Overweight';
          else cat = 'Obese';
          setResult(`${bmi.toFixed(2)} (${cat})`);
        }
        break;
        
      case 'calc-age':
        if (ageDob) {
            const birthDate = new Date(ageDob);
            const today = new Date();
            let years = today.getFullYear() - birthDate.getFullYear();
            let months = today.getMonth() - birthDate.getMonth();
            let days = today.getDate() - birthDate.getDate();
            
            if (days < 0) {
                months--;
                days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }
            setResult(`${years} Years, ${months} Months, ${days} Days`);
        }
        break;

      case 'calc-emi':
        if (emiPrincipal && emiRate && emiTime) {
            const p = parseFloat(emiPrincipal);
            const r = parseFloat(emiRate) / 12 / 100;
            const n = parseFloat(emiTime); // assuming months input
            
            const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
            setResult(`Monthly EMI: ${emi.toFixed(2)}`);
        }
        break;

      case 'calc-gst':
        if (gstAmount && gstRate) {
            const amt = parseFloat(gstAmount);
            const rate = parseFloat(gstRate);
            const gst = (amt * rate) / 100;
            const total = amt + gst;
            setResult(`GST Amount: ${gst.toFixed(2)} | Total: ${total.toFixed(2)}`);
        }
        break;
        
      case 'calc-sci':
        try {
            // Very basic eval safer would be a library, but for this demo:
            // eslint-disable-next-line no-eval
            setResult(eval(expression));
        } catch (e) {
            setResult("Error");
        }
        break;
    }
  };

  const renderInput = (label: string, value: string, setter: (v: string) => void, type: string = "number", placeholder: string = "") => (
    <div className="flex flex-col text-left">
      <label className="font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setter(e.target.value)}
        placeholder={placeholder}
        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
      />
    </div>
  );

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <div className="grid gap-6 mb-8">
        {tool.id === 'calc-bmi' && (
          <>
            {renderInput('Height (cm)', bmiHeight, setBmiHeight)}
            {renderInput('Weight (kg)', bmiWeight, setBmiWeight)}
          </>
        )}

        {tool.id === 'calc-age' && (
             renderInput('Date of Birth', ageDob, setAgeDob, 'date')
        )}

        {tool.id === 'calc-emi' && (
          <>
            {renderInput('Loan Amount', emiPrincipal, setEmiPrincipal)}
            {renderInput('Interest Rate (% per annum)', emiRate, setEmiRate)}
            {renderInput('Tenure (Months)', emiTime, setEmiTime)}
          </>
        )}

        {tool.id === 'calc-gst' && (
          <>
            {renderInput('Amount', gstAmount, setGstAmount)}
            {renderInput('GST Rate (%)', gstRate, setGstRate)}
          </>
        )}

        {tool.id === 'calc-sci' && (
           renderInput('Expression (e.g. 5 * (10 + 2))', expression, setExpression, 'text')
        )}
      </div>

      <button
        onClick={calculate}
        className="w-full py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-0.5"
      >
        Calculate
      </button>

      {result !== null && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide font-semibold">Result</p>
          <p className="text-3xl font-bold text-green-700">{result}</p>
        </div>
      )}
    </div>
  );
};

export default CalculatorTools;