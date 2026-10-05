const AuthInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#E5D1B8]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#C2956E] bg-[#2B2129] px-4 py-3.5 text-sm text-[#E5D1B8] outline-none transition placeholder:text-[#C2956E] focus:border-[#DD8E58] focus:ring-2 focus:ring-[#DD8E58]"
      />
    </div>
  );
};

export default AuthInput;