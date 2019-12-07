/**
 * Initiate PO from one trader to another 
 * @param {org.supplychain.network.InitiatePO} InitiatePO - the InitiatePO to be processed
 * @transaction
 */

function initiatePurchaseOrder(InitiatePO){
    console.log('start of initiate PO function');
    var factory = getFactory();
    var NS = 'org.supplychain.network';
    var me = getCurrentParticipant();
    
    // newResource(namespace, asset , primarykey)
    var order = factory.newResource(NS, 'PO', InitiatePO.orderId);
    order.itemList = InitiatePO.itemList;
    if(order.orderTotalPrice){
      order.orderTotalPrice = InitiatePO.orderTotalPrice;
    }
    
    order.orderStatus = 'INITIATED';
    order.orderer = me;
    order.vendor = InitiatePO.vendor;
    
    // getFullyQualifiedType() get the type of 'order'
    return getAssetRegistry(order.getFullyQualifiedType()).then(function(assetRegistry){
      return assetRegistry.add(order);
    }); 
  }
  
  /**
   * Track a trade of a commodity from trader to another 
   * @param {org.supplychain.network.TransferCommodity} trade 
   * @transaction
   */
  
  function transferCommodity(trade){
    console.log('start function transfer commodity');
    var NS = 'org.supplychain.network';
    var me = getCurrentParticipant();
    var factory = getFactory();
    
    trade.commodity.issuer = me;
    trade.commodity.owner = trade.newOwner;
    trade.commodity.purchaseOrder = trade.purchaseOrder; 
    
    var newTrace = factory.newConcept(NS, 'Trace');
    newTrace.timestamp = new Date();
    newTrace.location = trade.shipperLocation;
    newTrace.company = me;
    trade.commodity.trace.push(newTrace);
    
    return getAssetRegistry('org.supplychain.network.Commodity').then(function(assetRegistry){
      return assetRegistry.update(trade.commodity);
    });
  }