const OrderServiceInterface = require("../interfaces/order/ServiceInterface");
const OrderRepository = require("../../infrastructure/repositories/OrderRepository");
const Order = require("../models/OrderModel");
const NotFoundError = require("../../domain/exception/NotFoundError");
const AppError = require("../../domain/exception/AppError");
const state = require("../../utils/state");
/**
 * Clase que contiene la lógica de negocio para los pedidos.
 */
class OrderService extends OrderServiceInterface {
  /**
   * Recupera todos los pedidos del repositorio.
   *
   * @param {number} restaurantId - El identificador del restaurante.
   * @returns {Promise<Array<Order>>} Una promesa que se resuelve en un array de objetos Order.
   * @throws {NotFoundError} Si no se encuentran pedidos en el repositorio.
   */
  async getAll(restaurantId) {
    const rows = await OrderRepository.findAll(restaurantId);
    if (!rows || rows.length === 0) {
      throw new NotFoundError("No se encontraron pedidos.");
    }
    return rows.map((row) => Order.fromDB(row));
  }

  /**
   * Obtiene todos los platillos asociados a un pedido específico.
   * @param {number} id - ID del pedido.
   * @returns {Promise<Object[]>} - Lista de platillos asociados al pedido.
   */
  async getOrder(id) {
    try {
      const orderDetails = await OrderRepository.findOrderById(id);
      return orderDetails;
    } catch (error) {
      throw new AppError(
        `Error al obtener el pedido con ID ${id}: ${error.message}`
      );
    }
  }

  /**
   * Actualiza el estado de un platillo en un pedido.
   * @param {number} pedidoId - ID del pedido.
   * @param {number} platilloId - ID del platillo.
   * @param {string} estado - Nuevo estado del platillo.
   * @returns {Promise<Object>} - Resultado de la operación.
   */
  async updatePlatilloStatus(pedidoId, platilloId, estado) {
    // Validar el estado recibido usando el enum
    const validStates = Object.values(state.Pedido);
    if (!validStates.includes(estado)) {
      throw new AppError(
        `Estado inválido. Estados permitidos: ${validStates.join(", ")}.`,
        400
      );
    }

    // Verificar si el platillo existe
    const platillo = await OrderRepository.findPlatilloById(
      pedidoId,
      platilloId
    );
    if (!platillo.length) {
      throw new NotFoundError(
        `Platillo con ID ${platilloId} no encontrado en el pedido ${pedidoId}.`
      );
    }

    // Actualizar el estado del platillo
    const updateResult = await OrderRepository.updatePlatilloStatus(
      pedidoId,
      platilloId,
      estado
    );
    if (updateResult.affectedRows === 0) {
      throw new AppError(`No se pudo actualizar el estado del platillo.`, 500);
    }

    return { message: "Estado actualizado correctamente." };
  }

  /**
   * Actualiza el estado de un pedido.
   *
   * @param {string} id - El ID del pedido a actualizar.
   * @param {string} estado - El nuevo estado del pedido.
   * @throws {Error} Si el estado proporcionado no es válido.
   * @returns {Promise<Object>} El pedido actualizado.
   */
  async updateOrderStatus(id, estado) {
    // Validar el estado recibido usando el enum
    const validStates = Object.values(state.Pedido);
    if (!validStates.includes(estado)) {
      throw new AppError(
        `Estado inválido. Estados permitidos: ${validStates.join(", ")}.`
      );
    }
    // Verificar si el pedido existe y actualizar el estado
    const updatedOrder = await OrderRepository.updateStatusById(id, estado);
    return updatedOrder;
  }

  /**
   * Crea un nuevo pedido y lo asocia con los platillos indicados.
   *
   * @param {Object} orderData - Datos del pedido, que debe incluir 'nombre_cliente'.
   * @param {Array} platillos - Lista de objetos con platillos, cada uno con:
   *   - platilloId: ID del platillo.
   *   - cantidad: Cantidad del platillo.
   * @returns {Promise<Object>} - Detalles del pedido creado.
   * @throws {Error} - Si los datos son inválidos o ocurre un error en el repositorio.
   */
  async createOrder(orderData, platillos) {
    // Validar que los platillos sean válidos
    if (!platillos || platillos.length === 0) {
      throw new AppError("El pedido debe incluir al menos un platillo.");
    }

    platillos.forEach((platillo) => {
      if (!platillo.platilloId || !platillo.cantidad) {
        throw new AppError("Cada platillo debe incluir platilloId y cantidad.");
      }
    });

    // Delegar la creación del pedido al repositorio
    return await OrderRepository.create(orderData, platillos);
  }
  /**
   * Cancela un pedido o un platillo específico de un pedido
   * @param {number} pedidoId - ID del pedido
   * @param {number} [platilloId] - ID del platillo (opcional)
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async cancelOrder(pedidoId, platilloId = null) {
    try {
      return await OrderRepository.cancelOrder(pedidoId, platilloId);
    } catch (error) {
      throw new AppError(
        `Error al cancelar el ${platilloId ? "platillo" : "pedido"}: ${
          error.message
        }`,
        error.statusCode || 500
      );
    }
  }
}

module.exports = new OrderService();
