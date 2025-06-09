import React from 'react';
import { Link } from 'react-router-dom';

export default function RrethNesh() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-14 text-gray-800 space-y-16">
      {/* Title */}
      <section className="text-center space-y-4">
        <h1 
            style={{ fontFamily: 'Georgia, serif' }}
            className="text-4xl font-bold uppercase tracking-wide">
            RRETH NESH
        </h1>
        <p className="text-lg italic text-gray-600">
          Një udhëkryq mendimi, reflektimi dhe besimi.
        </p>
      </section>

      {/* Optional Image Placeholder */}
    <img src="../../public/kryqi.jpg" alt="Our Vision" className="w-full h-full object-cover rounded-xl" />


      {/* Our Mission */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold uppercase tracking-wide">Qëllimi Ynë</h2>
        <p>
          <b>Udhëkryqi</b> është një përpjekje për të krijuar një hapësirë reflektimi mbi vlerat dhe besimet
          që na kanë formuar si qytetërim. Ne besojmë se themeli i një shoqërie të shëndoshë 
          është besimi në të vërtetën dhe moralin objektiv. Këto të dyja i shohim të përsosura në
          trashëgiminë shpirtërore, filozofike dhe kulturore të Katolicizmit. 
          Nuk pretendojmë të ofrojmë gjithmonë përgjigje përfundimtare, 
          por dëshirojmë të vërtetojmë se ky besim dhe këto parime janë të besueshme, të arsyeshme dhe të nevojshme.
        </p>
      </section>

      {/* What Guides Us */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold uppercase tracking-wide">Parimet Tona</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Dinjiteti i njeriut si imazh i Zotit</li>
          <li>Pajtimi i fesë me arsyen</li>
          <li>Trashëgimia e përhershme dhe e vazhdueshme sekulare dhe fetare</li>
          <li>Kultura si shprehje e së bukurës dhe së mirës</li>
          <li>Rendi moral dhe ligji natyror</li>
          <li>Jeta e pasosur</li>
        </ul>
      </section>

      {/* What We Publish */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold uppercase tracking-wide">Puna JonË</h2>
        <p>Udhëkryqi boton artikuj që pasqyrojnë një përkushtim ndaj traditës dhe mendimit kritik:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Ese mbi teologjinë, filozofinë dhe jetën morale</li>
          <li>Reflektime kulturore dhe shoqërore</li>
          <li>Komente politike me përqasje parimore</li>
          <li>Shkrime origjinale dhe përkthime në gjuhën shqipe</li>
        </ul>
      </section>

      {/* Who We Are */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold uppercase tracking-wide">Rreth nesh</h2>
        <p>
          Jemi lexues dhe shkrues të zakonshëm nga troje të ndryshme
          që duam të ruajmë atë që është e vyer dhe themelore për shoqërinë, 
          dhe të ndihmojmë të tjerët të bëjnë të njëjtën gjë. 
          Ky projekt nuk përfaqëson një institucion apo autoritet; është një ftesë për <b>bashkëudhëtim</b>.
        </p>
      </section>

      {/* Why It Matters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold uppercase tracking-wide">Pse ËshtË e nevojshme</h2>
        <p>
          Në një botë që shpesh ndjen mungesën e kuptimit, e kaluara nuk është barrë, por dritë.
          <i> “Përparimi duhet të nënkuptojë që gjithmonë do të ndryshojmë botën për t’iu përshtatur vizionit; 
          në vend të kësaj, ne vazhdimisht po ndryshojmë vetë vizionin.”</i> Këto janë fjalët e mendimtarit të madh britanik G. K. Chesterton,
          të cilat shpjegojnë edhe qasjen tonë ndaj këtij aspekti.
          Një përpjekje për të ndërtuar një të ardhme me themel të fortë duhet të bazohet në një vizion të vërtetë, të mirë dhe të bukur. 
          Udhëkryqi është një hap modest në këtë drejtim.
        </p>
      </section>

      {/* CTA */}
      <section className="text-center space-y-2">
        <p className="text-lg font-medium">
          Nëse ndiheni të thirrur nga këto vlera, ju mirëpresim të lexoni, të ndani, apo edhe të kontribuoni me mendimet tuaja.
        </p>
        <Link to="/contact" className="text-red-700 font-semibold hover:text-black">
          Na kontaktoni →
        </Link>
      </section>
    </div>
  );
}
