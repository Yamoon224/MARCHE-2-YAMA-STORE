import Link from "next/link";

export function DeliveryBanner() {
  return (
    <section
      id="livraison"
      aria-labelledby="livraison-titre"
      className="mx-auto my-9 flex min-h-[130px] w-[min(1200px,calc(100%-22px))] items-center justify-between gap-2.5 rounded-[19px] bg-gradient-to-br from-[#087b35] via-[#15a54b] to-[#e8c928] px-[17px] py-5 text-white sm:min-h-[155px] sm:w-[min(1200px,calc(100%-44px))] sm:rounded-3xl sm:px-[5%] sm:py-6"
    >
      <div className="flex items-center gap-2.5 sm:gap-5">
        <span aria-hidden="true" className="text-[35px] sm:text-5xl">🛵</span>
        <div>
          <h2 id="livraison-titre" className="mb-1 text-[19px] font-extrabold sm:text-[27px]">Livraison rapide</h2>
          <p className="max-w-[175px] text-[10px] text-[#e7ffe9] sm:max-w-none sm:text-sm">
            À Paris et dans toute l&apos;Île-de-France. Faites-vous livrer vos saveurs préférées.
          </p>
        </div>
      </div>
      <Link href="/aisles" className="whitespace-nowrap rounded-full bg-[#ffdc37] px-3 py-2.5 text-[10px] font-extrabold text-[#5a3500] sm:px-[22px] sm:py-3.5 sm:text-base">
        Commander maintenant →
      </Link>
    </section>
  );
}
