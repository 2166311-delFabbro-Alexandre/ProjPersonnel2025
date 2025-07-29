import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
    const { cartCount } = useCart();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Votre Logo
                </Link>

                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">
                            Accueil
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/shop" className="nav-link">
                            Boutique
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/cart" className="nav-link cart-link">
                            Panier
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/login" className="nav-link admin-link">
                            Admin
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}