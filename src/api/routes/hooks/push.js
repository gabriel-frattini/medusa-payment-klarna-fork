export default async (req, res) => {
  const { klarna_order_id } = req.query;

  function isPaymentCollection(id) {
    return id && id.startsWith("paycol");
  }

  try {
    const orderService = req.scope.resolve("orderService");
    const klarnaProviderService = req.scope.resolve("pp_klarna");

    console.log("/klarna/push: klarna_order_id: ", klarna_order_id);

    const klarnaOrder = await klarnaProviderService.retrieveCompletedOrder(
      klarna_order_id
    );
    console.log("/klarna/push: klarnaOrder: ", klarnaOrder);

    const resourceId = klarnaOrder.merchant_data;

    console.log(
      "/klarna/push: isPaymentCollection: ",
      isPaymentCollection(resourceId)
    );
    if (isPaymentCollection(resourceId)) {
      await klarnaProviderService.acknowledgeOrder(klarnaOrder.order_id);
      console.log("/klarna/push: acknowledgeOrder: ", klarnaOrder.order_id);
    } else {
      const order = await orderService.retrieveByCartId(resourceId);
      console.log("/klarna/push: order: ", order);
      await klarnaProviderService.acknowledgeOrder(klarnaOrder.order_id);
      console.log("/klarna/push: acknowledgeOrder 2: ", klarnaOrder.order_id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
