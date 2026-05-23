const StatsCard = ({ title, value, icon, sub, progress, trend }) => (
  <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-6">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-4xl font-bold text-[#1A3022] mb-3 min-h-[2.5rem]">{value ?? '—'}</div>
    {typeof progress === 'number' ? (
      <>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#6BA67E] h-full transition-all duration-1000"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        {sub ? <p className="text-[11px] mt-2 text-gray-400 font-medium">{sub}</p> : null}
      </>
    ) : sub ? (
      <p className={`text-[11px] font-bold ${trend ? 'text-[#2D6A4F]' : 'text-gray-400'}`}>{sub}</p>
    ) : null}
  </div>
);

export default StatsCard;