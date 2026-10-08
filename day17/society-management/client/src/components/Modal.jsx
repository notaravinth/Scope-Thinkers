const Modal = ({ title, onClose, children }) => {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">NestHub</span>
            <h2>{title}</h2>
          </div>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
