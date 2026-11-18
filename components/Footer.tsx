import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 bg-[#17251b] pb-5 pt-9 text-[#dce8dd]">
      <div className="mx-auto grid w-[min(1200px,calc(100%-28px))] gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <b className="font-display text-2xl font-extrabold text-white">MARCHÉ DE YAMA</b>
          <p className="mt-1.5 text-[13px] leading-7 text-[#b7c7b9]">
            Les meilleurs produits, aux meilleurs prix. Retrouvez les saveurs de l&apos;Afrique dans votre quotidien, à Paris et en Île-de-France.
          </p>
        </div>
        <nav aria-label="La boutique">
          <h3 className="mb-2 text-[15px] font-extrabold text-white">La boutique</h3>
          <ul className="grid text-sm leading-8 text-[#b7c7b9]">
            <li><Link href="/#categories" className="hover:text-white">Nos catégories</Link></li>
            <li><Link href="/#combos" className="hover:text-white">Combos africains</Link></li>
            <li><Link href="/aisles" className="hover:text-white">Tous les produits</Link></li>
            <li><Link href="/cart" className="hover:text-white">Mon panier</Link></li>
            <li><Link href="/tracking" className="hover:text-white">Suivre ma commande</Link></li>
          </ul>
        </nav>
        <nav aria-label="Mon compte">
          <h3 className="mb-2 text-[15px] font-extrabold text-white">Mon compte</h3>
          <ul className="grid text-sm leading-8 text-[#b7c7b9]">
            <li><Link href="/login" className="hover:text-white">Connexion</Link></li>
            <li><Link href="/orders" className="hover:text-white">Mes commandes</Link></li>
          </ul>
        </nav>
        <div>
          <h3 className="mb-2 text-[15px] font-extrabold text-white">Paiement</h3>
          <p className="text-sm leading-7 text-[#b7c7b9]">
            Carte bancaire Visa ou Mastercard, ou espèces à la livraison et au retrait
          </p>
        </div>
      </div>
      <p className="mx-auto mt-6 flex w-[min(1200px,calc(100%-28px))] flex-wrap justify-between gap-2 border-t border-white/20 pt-4 text-[11px] text-[#9eb0a1]">
        <span>© 2026 Marché de Yama. Tous droits réservés.</span>
        <span>Les saveurs de chez nous, près de chez vous.</span>
      </p>
    </footer>
  );
}
