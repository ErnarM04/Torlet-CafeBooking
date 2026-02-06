import React from "react";

function Modal(){
    return(
        <div>
            <button className="d-btn" onClick={()=>document.getElementById('my_modal_2').showModal()}>open modal</button>
            <dialog id="my_modal_2" className="d-modal d-modal-bottom sm:d-modal-middle">
                <div className="d-modal-box">
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