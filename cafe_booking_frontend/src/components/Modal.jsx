import React, { useRef, useState } from "react";

function Modal(){
    const dialogId = "my_modal_2";
    const [armed, setArmed] = useState(false);
    const timerRef = useRef(null);

    function requestOpen() {
        // Require two consecutive clicks (within 600ms) to open.
        if (!armed) {
            setArmed(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setArmed(false), 600);
            return;
        }
        setArmed(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        document.getElementById(dialogId)?.showModal();
    }

    return(
        <div>
            <button className="d-btn" onClick={requestOpen}>
                {armed ? "Click again to open" : "Open modal"}
            </button>
            <dialog
                id={dialogId}
                className="d-modal d-modal-middle m-0 w-[calc(100%-2rem)] max-h-[90vh] overflow-hidden bg-transparent p-0"
            >
                <div className="d-modal-box w-full max-w-lg">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">
                        Press ESC, click outside, or press Close
                    </p>

                    <div className="d-modal-action">
                        <form method="dialog">
                            <button className="d-btn">Close</button>
                        </form>
                    </div>
                </div>

                <form method="dialog" className="d-modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}

export default Modal;