import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Bienvenue sur notre site</h1>
      <p>Découvrez notre collection de produits uniques</p>

      <div className="home-actions">
        <Link to="/shop" className="shop-button">
          Visiter la boutique
        </Link>
      </div>

      {/* <section className="home-features">
        <div className="feature">
          <h2>Produits de qualité</h2>
          <p>Tous nos produits sont soigneusement sélectionnés pour leur qualité exceptionnelle.</p>
        </div>

        <div className="feature">
          <h2>Livraison rapide</h2>
          <p>Nous expédions rapidement vos commandes pour que vous puissiez en profiter au plus vite.</p>
        </div>

        <div className="feature">
          <h2>Service client</h2>
          <p>Notre équipe est disponible pour répondre à toutes vos questions.</p>
        </div>
      </section> */}
    </div>
  );
}