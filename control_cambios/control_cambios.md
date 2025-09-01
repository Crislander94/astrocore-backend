# Control de Cambios Pendientes - Backend

## Estado Actual de Entidades

### ✅ Entidades Completadas (Zod + Entity Class)
- **Payment.ts** - Esquemas Zod + PaymentEntity con lógica de negocio
- **Product.ts** - Esquemas Zod + ProductEntity con lógica de negocio  
- **User.ts** - Esquemas Zod + UserEntity con lógica de negocio
- **VerificationCode.ts** - Esquemas Zod + VerificationCodeEntity con lógica de negocio

### ⚠️ Entidades Parcialmente Completadas (Solo Zod)
- **CartItem.ts** - ✅ Convertido a Zod, ❌ Falta Entity Class
- **Order.ts** - ✅ Convertido a Zod, ❌ Falta Entity Class
- **Address.ts** - ✅ Convertido a Zod, ❌ Falta Entity Class

## Cambios Pendientes

### 1. CartItem Entity - Lógica de Negocio Pendiente
- [ ] Validar cantidad (límites mín/máx)
- [ ] Calcular subtotal (cantidad × precio)
- [ ] Verificar disponibilidad del producto
- [ ] Aplicar descuentos del producto
- [ ] Validar aplicación de IVA

### 2. Order Entity - Lógica de Negocio Pendiente
- [ ] Calcular totales (subtotal, impuestos, envío, descuentos)
- [ ] Validar transiciones de estado
- [ ] Verificar si es cancelable
- [ ] Verificar si es reembolsable
- [ ] Generar número de orden
- [ ] Validar items del pedido
- [ ] Calcular tiempo estimado de entrega

### 3. Address Entity - Lógica de Negocio Pendiente
- [ ] Validar formato (código postal, teléfono por país)
- [ ] Verificar cobertura de envío
- [ ] Calcular costo de envío
- [ ] Formatear dirección para etiquetas
- [ ] Validar completitud por país
- [ ] Determinar zona de entrega (urbana/rural)

## Prioridad de Implementación

1. **Alta**: OrderEntity (crítico para flujo de compra)
2. **Media**: CartItemEntity (importante para carrito)
3. **Baja**: AddressEntity (funcionalidad básica ya existe)

## Notas Técnicas

- Todas las entidades ya tienen esquemas Zod implementados
- Mantener consistencia con el patrón DDD existente
- Las Entity Classes deben ser inmutables (readonly properties)
- Usar métodos que retornen nuevas instancias para cambios de estado
