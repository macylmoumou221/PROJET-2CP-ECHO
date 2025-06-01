import { FcGoogle } from "react-icons/fc"

export default function GoogleSignInButton({ onClick, buttonText }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-gray-700 py-2 rounded-lg text-white font-bold hover:bg-gray-800 cursor-pointer"
    >
      <FcGoogle size={20} />
      {buttonText}
    </button>
  )
}
