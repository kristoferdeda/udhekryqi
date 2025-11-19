import { useState } from "react";
import axios from "axios";

export default function Abonohu() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

const handleSubscribe = async (e) => {
  e.preventDefault();
  setStatus("loading");

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/subscriptions`,
      { email }
    );
    setStatus(res.data.message);
    setEmail("");
  } catch (err) {
    console.error(err);
    setStatus("Diçka shkoi keq. Provo përsëri.");
  }
};


  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1
        className="text-3xl font-bold text-center mb-6"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Abonohu në revistën Udhëkryqi
      </h1>

      <p className="text-center text-gray-600 mb-8" style={{ fontFamily: "Georgia, serif" }}>
        Vendosni email-in tuaj për të marrë njoftime sa herë të botojmë një artikull të ri.
      </p>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Shkruani email-in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md text-lg"
        />

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-md text-lg hover:bg-red-700"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Abonohu
        </button>
      </form>

      {status && (
        <p className="mt-4 text-center text-gray-800 font-semibold">
          {status}
        </p>
      )}
    </div>
  );
}
