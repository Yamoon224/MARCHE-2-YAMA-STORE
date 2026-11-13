const PROMISES = [
  { title: "Livraison rapide", text: "Choisissez votre créneau : matin, après-midi ou soir." },
  { title: "Fraîcheur garantie", text: "Produits frais suivis par lot et date limite." },
  { title: "Paiement flexible", text: "Mobile money, carte ou espèces à la livraison." },
];

export function Hero() {
  return (
    <section className="bg-brand-red text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Les meilleurs produits, aux meilleurs prix.</h1>
        <p className="mt-2 max-w-xl text-white/90">Vos courses livrées à domicile à Yama, ou à retirer en magasin.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {PROMISES.map((p) => (
            <li key={p.title} className="rounded-lg bg-white/10 p-4">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-white/90">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
