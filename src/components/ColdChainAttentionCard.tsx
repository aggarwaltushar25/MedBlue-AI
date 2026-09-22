/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceDot,
} from 'recharts';
import { Thermometer, ArrowRight, ShieldAlert } from 'lucide-react';
import { ColdChainAttentionShipment } from '../types';

interface ColdChainAttentionCardProps {
  data: ColdChainAttentionShipment;
  onInspectShipment: (shipmentId: string) => void;
}

export const ColdChainAttentionCard: React.FC<ColdChainAttentionCardProps> = ({
  data,
  onInspectShipment,
}) => {
  // Peak breach point
  const maxBreachItem = data.temperatures.reduce(
    (max, item) => (item.temp > max.temp ? item : max),
    data.temperatures[0]
  );

  return (
    <div className="bg-white rounded-lg border border-rose-200 p-5 shadow-xs mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600" />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              {data.title}
            </h3>
            <p className="text-xs text-rose-700 font-medium">
              {data.shipmentId} • {data.supplier}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {data.description}
      </p>

      <div className="mb-3">
        <button
          id={`btn-inspect-${data.shipmentId}`}
          onClick={() => onInspectShipment(data.shipmentId)}
          className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Inspect shipment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Temperature Excursion Line Chart */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <span className="font-medium text-slate-700">Thermal Excursion Log (°C)</span>
          <span className="text-rose-600 font-semibold font-mono">Max: {maxBreachItem.temp}°C</span>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.temperatures} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              {/* Safe zone: 2–8°C */}
              <ReferenceArea
                y1={2}
                y2={8}
                fill="#dcfce7"
                fillOpacity={0.6}
                stroke="#86efac"
                strokeDasharray="2 2"
              />
              {/* Breach zone: >8°C */}
              <ReferenceArea
                y1={8}
                y2={14}
                fill="#fee2e2"
                fillOpacity={0.6}
                stroke="#fca5a5"
                strokeDasharray="2 2"
              />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[0, 14]}
                ticks={[2, 8, 12]}
                tick={{ fontSize: 9, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '4px 8px',
                }}
                formatter={(val: any) => [`${val}°C`, 'Temperature']}
                labelFormatter={(time) => `Time: ${time}`}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#DC2626' }}
              />
              {/* Red marker at breach point */}
              <ReferenceDot
                x={maxBreachItem.time}
                y={maxBreachItem.temp}
                r={5}
                fill="#B91C1C"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-emerald-200 border border-emerald-400"></span>
            <span>Safe: 2–8°C</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-rose-200 border border-rose-400"></span>
            <span>Breach: &gt;8°C</span>
          </div>
          <div className="flex items-center gap-1 text-rose-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-700"></span>
            <span>Peak Breach: 10:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
