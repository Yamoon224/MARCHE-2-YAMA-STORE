import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 bg-[#17251b] pb-5 pt-9 text-[#dce8dd]">
      <div className="mx-auto grid w-[min(1200px,calc(100%-28px))] gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <b className="font-display text-2xl font-extrabold text-white">MARCHÉ DE YAMA</b>
          <p className="mt-1.5 text-sm leading-7 text-[#b7c7b9]">Les meilleurs produits, aux meilleurs prix.</p>
        </div>
        <nav aria-label="La boutique">
          <h3 className="mb-2 text-[15px] font-extrabold text-white">La boutique</h3>
          <ul className="grid text-sm leading-8 text-[#b7c7b9]">
            <li><Link href="/rayons" className="hover:text-white">Tous les produits</Link></li>
            <li><Link href="/panier" className="hover:text-white">Mon panier</Link></li>
          </ul>
        </nav>
        <nav aria-label="Mon compte">
          <h3 className="mb-2 text-[15px] font-extrabold text-white">Mon compte</h3>
          <ul className="grid text-sm leading-8 text-[#b7c7b9]">
            <li><Link href="/connexion" className="hover:text-white">Connexion</Link></li>
            <li><Link href="/commandes" className="hover:text-white">Mes commandes</Link></li>
          </ul>
        </nav>
        <div>
          <h3 className="mb-2 text-[15px] font-extrabold text-white">Paiement</h3>
          <p className="text-sm leading-7 text-[#b7c7b9]">
            Orange Money · MTN MoMo · Moov Money · Wave · Carte · Espèces à la livraison
          </p>
        </div>
      </div>
      <p className="mx-auto mt-6 w-[min(1200px,calc(100%-28px))] border-t border-white/20 pt-4 text-xs text-[#9eb0a1]">
        © 2026 Marché de Yama. Tous droits réservés.
      </p>
    </footer>
  );
}
