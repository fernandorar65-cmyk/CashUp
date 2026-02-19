Tablas del sistema

clients – Información general de los clientes que solicitan préstamos.
loans – Préstamos otorgados con sus condiciones financieras (monto, tasa, plazo, tipo de interés, estado).
loan_refinances – Registro de refinanciamientos que vincula un préstamo original con uno nuevo.
installments – Cuotas generadas por cada préstamo, representan la obligación periódica de pago.
payments – Pagos realizados por los clientes (dinero efectivamente recibido).
payment_applications – Distribución de un pago entre una o varias cuotas, permite pagos parciales o múltiples.
late_fees – Penalidades o intereses generados por atraso en cuotas vencidas.
loan_charges – Cargos adicionales asociados al préstamo (comisiones, seguros, gastos administrativos).
penalty_policies – Reglas configurables para el cálculo de mora (porcentaje, días de gracia, tipo de cálculo).
collection_actions – Registro de gestiones de cobranza realizadas a clientes con cuotas vencidas.
loan_history – Historial de cambios importantes realizados sobre un préstamo (estado, tasa, condiciones).
credit_evaluations – Evaluaciones de riesgo crediticio realizadas antes de aprobar un préstamo.
client_background_checks – Registro de verificaciones externas (judiciales, listas de riesgo, validaciones externas) sin almacenar datos sensibles detallados.
external_debts – Deudas externas detectadas que ayudan a calcular el nivel de endeudamiento del cliente.
credit_score_history – Historial del puntaje de riesgo del cliente a lo largo del tiempo.
users – Usuarios del sistema (administradores, analistas, cobradores).
roles – Roles o perfiles que definen permisos dentro del sistema.
user_roles – Relación entre usuarios y roles.
audit_logs – Registro de acciones críticas realizadas en el sistema para fines de auditoría y trazabilidad.


Descripción general del sistema

Este sistema es una plataforma profesional de gestión de préstamos que permite administrar clientes, 
evaluar su riesgo crediticio, otorgar préstamos con interés simple o compuesto, generar cronogramas de pago, 
registrar pagos parciales o totales, calcular mora configurable por atraso y gestionar refinanciamientos 
sin perder historial financiero. Incluye módulo de evaluación de riesgo mediante scoring interno y verificaciones externas, 
trazabilidad completa mediante auditoría y control de permisos por roles. Está diseñado 
para operar como una microfinanciera digital con estructura escalable, trazable y preparada para crecimiento futuro.