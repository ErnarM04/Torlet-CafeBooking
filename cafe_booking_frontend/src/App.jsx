import React from "react";
import './App.css'
import Modal from "./components/Modal";

function App() {
  return (
    <>
  {/* BUTTONS */}
  <div className="space-x-2 mb-6">
    <button className="d-btn d-btn-primary">Primary</button>
    <button className="d-btn d-btn-secondary">Secondary</button>
    <button className="d-btn d-btn-ghost">Ghost</button>
    <button className="d-btn d-btn-outline">Outline</button>
    <button className="d-btn d-btn-warning">Warning</button>
  </div>

  {/* MODAL (modal-open pattern) */}
  <Modal></Modal>

  {/* FORM */}
  <div className="space-y-4 max-w-md mb-6">
    <div className="d-form-control">
      <label className="d-label">
        <span className="d-label-text">Input</span>
      </label>
      <input
        type="text"
        placeholder="Type here"
        className="d-input d-input-bordered"
      />
    </div>

    <div className="d-form-control">
      <label className="d-label">
        <span className="d-label-text">Textarea</span>
      </label>
      <textarea
        className="d-textarea d-textarea-bordered"
        placeholder="Message"
      />
    </div>

    <div className="d-form-control">
      <label className="d-label">
        <span className="d-label-text">Select</span>
      </label>
      <select className="d-select d-select-bordered">
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
    </div>

    <div className="d-form-control">
      <label className="d-label cursor-pointer">
        <span className="d-label-text">Checkbox</span>
        <input type="checkbox" className="d-checkbox" />
      </label>
    </div>
  </div>

  {/* TABLE */}
  <div className="overflow-x-auto mb-6">
    <table className="d-table d-table-zebra d-table-pin-rows d-table-pin-cols">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>1</th>
          <td>Order A</td>
          <td>Done</td>
        </tr>
        <tr>
          <th>2</th>
          <td>Order B</td>
          <td>Pending</td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* PAGINATION */}
  <div className="d-join mb-6">
    <button className="d-join-item d-btn">«</button>
    <button className="d-join-item d-btn d-btn-active">1</button>
    <button className="d-join-item d-btn">2</button>
    <button className="d-join-item d-btn">»</button>
  </div>

  {/* CARD */}
  <div className="d-card w-96 bg-base-100 shadow mb-6">
    <div className="d-card-body">
      <h2 className="d-card-title">Card title</h2>
      <p>Simple card content</p>
      <div className="d-card-actions justify-end">
        <button className="d-btn d-btn-primary">Action</button>
      </div>
    </div>
  </div>

  {/* BADGE */}
  <div className="space-x-2 mb-6">
    <span className="d-badge d-badge-primary">Primary</span>
    <span className="d-badge d-badge-secondary">Secondary</span>
    <span className="d-badge d-badge-outline">Outline</span>
  </div>

  {/* SPINNER */}
  <span className="d-loading d-loading-spinner d-loading-md mb-6" />

  {/* ALERT */}
  <div className="d-alert d-alert-info mt-6">
    <span>Informational alert message</span>
  </div>
</>

  );
}

export default App
