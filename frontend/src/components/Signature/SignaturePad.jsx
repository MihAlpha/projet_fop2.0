import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaPen, FaCheck, FaTimes, FaSignature } from 'react-icons/fa';

const SignaturePad = ({ onClose, onValidate }) => {
  const sigCanvas = useRef(null);

  const clear = () => {
    sigCanvas.current.clear();
  };

  const save = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onValidate(dataURL); // Envoie la signature à l'extérieur
    } else {
      alert("Veuillez dessiner votre signature.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h3><FaSignature style={{ marginRight: '8px' }} /> Signez ici</h3>

          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ width: 400, height: 200, className: 'sigCanvas' }}
            backgroundColor="white"
          />

          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button onClick={clear}>
              <FaPen style={{ marginRight: '5px' }} />
              Effacer
            </button>
            <button onClick={save}>
              <FaCheck style={{ marginRight: '5px' }} />
              Valider
            </button>
            <button onClick={onClose}>
              <FaTimes style={{ marginRight: '5px' }} />
              Fermer
            </button>
          </div>

      </div>
    </div>
  );
};

export default SignaturePad;
