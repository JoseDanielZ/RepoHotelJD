const variants: Record<string, string> = {
  // Estados reserva
  PEN: 'bg-yellow-100 text-yellow-800',
  CON: 'bg-green-100 text-green-800',
  CAN: 'bg-red-100 text-red-800',
  CMP: 'bg-blue-100 text-blue-800',
  EXP: 'bg-gray-100 text-gray-700',
  FIN: 'bg-blue-100 text-blue-800',
  EMI: 'bg-yellow-100 text-yellow-800',
  // Estados habitación
  DIS: 'bg-green-100 text-green-800',
  OCU: 'bg-red-100 text-red-800',
  MNT: 'bg-orange-100 text-orange-800',
  FDS: 'bg-purple-100 text-purple-800',
  INA: 'bg-gray-100 text-gray-600',
  // Estados pago
  APR: 'bg-green-100 text-green-800',
  PRO: 'bg-blue-100 text-blue-800',
  REC: 'bg-red-100 text-red-800',
  PAG: 'bg-green-100 text-green-800',
  ANU: 'bg-red-100 text-red-800',
  // Estados usuario
  ACT: 'bg-green-100 text-green-800',
  BLO: 'bg-red-100 text-red-800',
  // Checkin
  default: 'bg-gray-100 text-gray-700',
};

const labels: Record<string, string> = {
  PEN: 'Pendiente', CON: 'Confirmada', CAN: 'Cancelada', CMP: 'Completada',
  EXP: 'Expirada', FIN: 'Finalizada', EMI: 'Emitida', PAG: 'Pagada',
  ANU: 'Anulada', DIS: 'Disponible', OCU: 'Ocupada', MNT: 'Mantenimiento',
  FDS: 'Fuera servicio', INA: 'Inactiva', ACT: 'Activo', BLO: 'Bloqueado',
  APR: 'Aprobado', PRO: 'En proceso', REC: 'Rechazado',
};

export function Badge({ value }: { value: string }) {
  const cls = variants[value] ?? variants.default;
  const label = labels[value] ?? value;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge value={status} />;
}
