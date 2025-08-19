<template>
    <h1>Politicas / Reglamento</h1>
    <div class="acordeon-container">
        <div class="acordeon">
            <div class="acordeon-item">
                <button class="acordeon-header" @click="toggle(0)">
                    Reglamento Asesor
                </button>
                <div v-show="activo === 0" class="acordeon-body">
                    <h3>Funciones del Asesor</h3>

                    <div class="bloque">
                        <h4>Cobrar</h4>
                        <p>
                            Cuando el asesor ya obtiene una cartera o listado de clientes, este es el encargado de
                            recolectar y visitar diariamente dichos deudores, esto con el fin de recibir el pago
                            establecido, el cual incluye el capital y el interés correspondiente de cada crédito
                            realizado.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Refinanciar Crédito</h4>
                        <p>
                            Ejecutar los refinanciamientos para multiplicar resultados y obtener mayor rentabilidad.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Avisar al encargado cuando</h4>
                        <ul>
                            <li>Un cliente se cambia de ubicación</li>
                            <li>Un cliente tiene 4 días seguidos sin pago</li>
                            <li>Se pierde contacto total con el cliente</li>
                            <li>El cliente sobrepasa límites verbales o físicos</li>
                        </ul>
                    </div>

                    <div class="bloque">
                        <h4>Recuperar Morosos</h4>
                        <p>
                            Planifica estrategias para recuperar pagos pendientes y contactar morosos.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Asistir en nueva ruta</h4>
                        <p>
                            Apoya la apertura de nuevas rutas cuando lo solicite el encargado.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Prestar efectivamente</h4>
                        <p>
                            Buscar nuevos clientes y analizar cada crédito antes de autorizar.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Crear buenos vínculos</h4>
                        <p>
                            Generar confianza y fidelización con los clientes.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Mantiene o Asciende</h4>
                        <p>
                            Cumplir metas diarias y trabajar por incrementarlas.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Aportar ideas</h4>
                        <p>
                            Contribuir con ideas para el crecimiento y mejora de la empresa.
                        </p>
                    </div>

                    <div class="bloque">
                        <h4>Funciones Extras</h4>
                        <p>
                            Estar disponible para tareas adicionales relacionadas con la empresa.
                        </p>
                    </div>

                    <h3 class="mt-4">Reglas para Asesores</h3>

                    <div class="bloque">
                        <h4>Reglas para Asesores</h4>
                        <ol>
                            <li>
                                1. La hora de inicio de labores es entre las 9:00 a.m. y 9:30 a.m., sujeta a cambios por
                                reuniones ordinarias o tareas adicionales según lo requiera la empresa.
                            </li>
                            <li>
                                2. El regreso mínimo al apartamento debe ser a las 6:00 p.m. En caso de terminar su
                                recorrido antes, se espera que el asesor continúe con actividades de recuperación de
                                cartera, búsqueda de clientes morosos o apertura de nuevas oportunidades de crédito.
                            </li>
                            <li>
                                3. Durante el horario laboral, el asesor debe dedicar su tiempo exclusivamente a las
                                funciones asignadas, procurando eficacia y eficiencia en sus actividades diarias.
                            </li>
                            <li>
                                4. Las tarjetas físicas de los clientes deben coincidir con la información registrada en
                                el
                                sistema para evitar errores o inconsistencias.
                            </li>
                            <li>
                                5. El asesor debe atender y cumplir las órdenes, sugerencias o indicaciones impartidas
                                por
                                el líder o encargado de sede de manera respetuosa y diligente.
                            </li>
                            <li>
                                6. Es responsabilidad de cada asesor velar por el correcto funcionamiento general de la
                                empresa, promoviendo un ambiente de compromiso y colaboración.
                            </li>
                            <li>
                                7. No está permitido emitir comentarios negativos o malintencionados sobre la empresa ni
                                sobre sus compañeros de trabajo, ya que esto afecta el ambiente laboral y el sentido de
                                pertenencia.
                            </li>
                            <li>
                                8. Cada asesor debe recibir y cumplir con las metas, tareas o actividades asignadas,
                                procurando siempre su cumplimiento en tiempo y forma.
                            </li>
                            <li>
                                9. La asistencia a reuniones, citaciones o encuentros programados por la empresa es
                                obligatoria y debe asumirse con total disposición y puntualidad.
                            </li>
                            <li>
                                10. Es deber del asesor responder con respeto y disposición ante cualquier pregunta,
                                revisión o solicitud realizada por el auditor.
                            </li>
                            <li>
                                11. La comunicación con el encargado de sede y el líder debe ser directa, fluida y
                                respetuosa, evitando intermediarios o malentendidos.
                            </li>
                            <li>
                                12. Todas las herramientas de trabajo deben mantenerse en óptimas condiciones. Si alguna
                                herramienta presenta fallas o inconvenientes, debe ser reportada de inmediato al
                                encargado de sede para su respectiva solución.
                            </li>
                            <li>
                                13. El asesor debe capacitarse para desarrollar habilidades de comunicación asertiva,
                                objetiva e inteligente con los clientes, garantizando un trato profesional y efectivo.
                            </li>
                            <li>
                                14. Es responsabilidad del asesor recaudar, archivar y cargar al sistema las fotos o
                                recibos de los gastos operativos, y asegurarse de hacerlos llegar al encargado de sede
                                oportunamente.
                            </li>
                            <li>
                                15. Está estrictamente prohibido disponer o utilizar el dinero correspondiente a la ruta
                                para fines personales o cualquier gasto no relacionado con herramientas de trabajo o
                                actividades del negocio.
                            </li>
                            <li>
                                16. Queda completamente prohibido presentarse a laborar o continuar trabajando bajo los
                                efectos del alcohol o sustancias psicoactivas, ya que esto compromete la seguridad y
                                profesionalismo del equipo.
                            </li>
                            <li>
                                17. No está permitido fumar frente a los clientes, con el fin de mantener una imagen
                                profesional y respetuosa.
                            </li>
                            <li>
                                18. La empresa considera un acto inmoral y grave tomar cuotas ajenas de los clientes.
                                Esta práctica está totalmente prohibida y será sancionada severamente.
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <div class="acordeon-item">
            <button class="acordeon-header" @click="toggle(1)">
                Datos
            </button>
            <div v-show="activo === 1" class="acordeon-body">
                <div class="bloque">
                    <h4>Datos Funcionario</h4>
                    <ul>

                    </ul>
                </div>
            </div>
        </div>

        <div class="contenedor-flotante">
            <!-- Botón principal -->
            <button class="boton-principal" type="button" @click="menuStore.toggle">
                <img src="/src/assets/Icons/Settings.png" alt="Menu" class="icono-principal" />
            </button>

            <!-- Opciones -->
            <ul class="opciones" :class="{ abierta: menuStore.abierto }">
                <li v-for="(opcion, index) in opciones" :key="opcion.nombre" :style="{ '--i': index }"
                    :class="{ show: menuStore.abierto }">
                    <button class="boton-opcion" type="button" @click="opcion.accion">
                        <img :src="opcion.icono" :alt="opcion.nombre" />
                    </button>
                </li>
            </ul>
        </div>
    </div>


</template>

<script setup>
import { ref } from 'vue'
import { useMenuStore } from '@/stores/menu'


/* --- Acordeón --- */
const activo = ref(null)

function toggle(index) {
    activo.value = activo.value === index ? null : index
}

/* --- Menú Flotante --- */
const menuStore = useMenuStore()

const opciones = [
    {
        nombre: 'Gmail',
        icono: '/src/assets/icons/Gmail.png',
        accion: () => {
            window.open('https://mail.google.com/mail/u/0/?view=cm&fs=1&to=digitalsolucioncj@gmail.com&su=Solicitud%20de%20Soporte&body=Por%20favor%20describe%20tu%20consulta%20aquí...', '_blank')
        }
    },
    {
        nombre: 'Whatsapp',
        icono: '/src/assets/icons/Whats.png',
        accion: () => {
            window.open('https://wa.me/+573228107910', '_blank')
        }
    },
    {
        nombre: 'Teléfono',
        icono: '/src/assets/icons/tel.png',
        accion: () => {
            window.open('tel:3228107910')
        }
    }
]
</script>


<style scoped>
.acordeon-container {
    padding: var(--padding-1);
    background: var(--color-background);
    color: var(--color-oscuro);
    line-height: 1.7;
}

.acordeon-item {
    border-radius: var(--border-radius-2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 1rem;
    background-color: var(--color-background);
}

.acordeon-header {
    background-color: var(--color-background);
    color: var(--color-oscuro);
    padding: 1rem 1.2rem;
    width: 100%;
    text-align: left;
    font-weight: bold;
    font-size: 1.2rem;
    cursor: pointer;
    border-radius: var(--border-radius-2);
}

.acordeon-body {
    padding: 1.5rem;
    background-color: var(--color-blanco);
    color: var(--color-oscuro);
    border-top: 1px solid var(--color-info-gris);
}

.acordeon-body h3 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: var(--color-oscuro);
}

.bloque {
    margin-bottom: 1.6rem;
    background-color: var(--color-background);
    padding: 1rem;
    border-left: 4px solid var(--color-aprobado-1);
    border-radius: var(--border-radius-2);
}

.bloque ol li {
    margin-bottom: 0.75rem;
}


.bloque h4 {
    font-size: 1.2rem;
    color: var(--color-oscuro);
    margin-bottom: 0.5rem;
}

.bloque p,
.bloque li {
    font-size: 1.05rem;
    color: var(--color-oscuro);
}



ul {
    padding-left: 1.5rem;
}

.mt-4 {
    margin-top: 2rem;
}

/*===================Settings=================*/
.contenedor-flotante {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 999;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
.contenedor-flotante {
    animation: pulse 2s infinite ease-in-out;
}

.boton-principal {
    width: 60px;
    height: 60px;
    border: none;
    background: transparent;
    cursor: pointer;
    filter: drop-shadow(0 2px 5px var(--color-oscuro));
}

.boton-principal .icono-principal {
    width: 60px;
    height: 60px;
}

.opciones {
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    bottom: 70px;
    right: 5px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
}

.opciones.abierta {
    pointer-events: auto;
}

.opciones li {
    margin-bottom: 10px;
    opacity: 0;
    transform: translateY(0);
    transition: transform 0.3s ease, opacity 0.3s ease;
    z-index: calc(100 - var(--i));
}

.opciones li.show {
    opacity: 1;
    transform: translateY(calc(-1px * (3 - var(--i))));
}

.boton-opcion {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.boton-opcion:hover {
    transform: scale(1.2);
}

.boton-opcion img {
    width: 2.8rem;
    height: 2.8rem;
}
</style>
