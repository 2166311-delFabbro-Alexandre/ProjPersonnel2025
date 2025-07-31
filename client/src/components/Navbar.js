import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

/**
 * Composant pour la barre de navigation.
 * Affiche les liens vers les différentes pages de l'application.
 * @returns {JSX.Element} - Le composant de la barre de navigation
 *
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function Navbar() {
    // Hook pour accéder au contexte du panier
    const { cartCount } = useCart();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo de l'application */}
                <Link to="/" className="navbar-logo">
                    Votre Logo
                </Link>

                {/* Menu de navigation */}
                <ul className="nav-menu">
                    <li className="nav-item">
                        {/* Lien vers la page d'accueil */}
                        <Link to="/" className="nav-link">
                            Accueil
                        </Link>
                    </li>
                    <li className="nav-item">
                        {/* Lien vers la page de la boutique */}
                        <Link to="/shop" className="nav-link">
                            Boutique
                        </Link>
                    </li>
                    <li className="nav-item">
                        {/* Lien vers la page du panier avec le nombre d'articles */}
                        <Link to="/cart" className="nav-link cart-link">
                            Panier
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    </li>
                    <li className="nav-item">
                        {/* Lien vers la page des soins */}
                        <Link to="/soins" className="nav-link">
                            Soins
                        </Link>
                    </li>
                    <li className="nav-item">
                        {/* Lien vers la page de connexion administrateur */}
                        <Link to="/admin/login" className="nav-link admin-link">
                            Admin
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}