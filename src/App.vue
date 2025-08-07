<script setup>


</script>
<template>
 <router-view />
</template>

<style>

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

:root {
    --color-azul-1: #0188db;
    --color-amarillo-2: #f4b908;
    --color-naranja-3: #f48608;
    --color-morado-4:#b5106b;
    --color-rojo-5: #b6212b;
    --color-aprobado-1: #67c119;
    --color-blanco: #FFF;
    --color-info-gris: #7d8da1;
    --color-info-luz: #dce1eb;
    --color-oscuro: #363949;
    --color-light: rgba(132, 139, 200, 0.18);
    --color-primary-variant: #2749aa;
    --color-dark-variant: #677483;
    --color-background: #f6f6f9;
    --card-border-radius: 2rem;
    --border-radius-1: 0.4rem;
    --border-radius-2: 0.8rem;
    --border-radius-3: 1.2rem;

    --card-padding: 1rem;
    --padding-1: 1.2rem;
    --box-shadow: 0 2rem 3rem var(--color-light);
}

*{
  margin: 0;
  padding: 0;
  outline: 0;
  appearance: none;
  border: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}



html{
  font-size: 14px;
}

body{
  font-family: 'poppins', sans-serif;
  width: 100vw;
  height: 100vh;
  font-size: 0.88rem;
  background: var(--color-background);
  user-select: none;
  overflow-x: hidden;

}

body.dark-theme-variables{
    --color-background:#181a1e;
    --color-blanco:#202528;
    --color-oscuro:#edeffd;
    --color-dark-variant:#a3bdcc;
    --color-light: rgba(0,0,0,0.4);
    --box-shadow:0 2rem 3rem var(--color-light);
}

body, html, div, header, main, aside, section, button, input {
  transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease;
}


/* =================== Media Queries  =================== */
/*1200px*/

</style>
