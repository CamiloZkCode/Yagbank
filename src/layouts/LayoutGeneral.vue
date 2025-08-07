<template>
    <div class="contenedor">
        <Asidebar />
        <main>
            <router-view />
        </main>
    </div>

</template>


<script setup>

import Asidebar from '../components/Asidebar.vue'



</script>


<style scoped>
.contenedor {
    display: grid;
    width: 96%;
    margin: 0 auto;
    gap: 1.4rem;
    grid-template-columns: 16rem 1fr;
    background: var(--color-background);
    color: var(--color-oscuro);
}

main {
    margin-top: 1rem;
}


@media screen and (max-width: 768px) {
    .contenedor {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin: 0;
        gap: 0;
    }

    main {
        margin-top: 5rem;
        padding: 1rem;
        width: 100%;
    }
}
</style>