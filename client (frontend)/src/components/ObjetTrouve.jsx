import LostFoundPage from "./LostFoundPage"
import Recherche from "./Recherche"
import "./ObjetTrouve.css"

const ObjetTrouve = () => {
  return (
    <div className="App">
      <div className="Navbar"></div>
      <div className="container">
        <div className="recherche">
          <Recherche />
        </div>
        <div className="main-content">
          <LostFoundPage darkMode={false} />
        </div>
      </div>
    </div>
  )
}

export default ObjetTrouve
