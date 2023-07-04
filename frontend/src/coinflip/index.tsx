import { useState } from "react";
import Coinflip from "./coinflip";

const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Open Modal</button>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              Close Modal
            </button>
            <Coinflip />
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
