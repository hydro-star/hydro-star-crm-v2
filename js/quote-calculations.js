/* Hydro Star CRM — cálculo puro de orçamento. */
(function(global){
 "use strict";
 function sumLines(lines){
  return (Array.isArray(lines)?lines:[]).reduce((sum,line)=>{
   const quantity=Math.max(0,Number(line&&line.quantity||0));
   const unitPrice=Math.max(0,Number(line&&line.unitPrice||0));
   return sum+quantity*unitPrice;
  },0);
 }
 function calculate(materialLines,laborLines,profitRate,riskRate){
  const materialsSubtotal=sumLines(materialLines),laborSubtotal=sumLines(laborLines);
  const materialProfitValue=materialsSubtotal*Math.max(0,Number(profitRate||0))/100;
  const riskValue=laborSubtotal*Math.max(0,Number(riskRate||0))/100;
  return {materialsSubtotal,materialProfitValue,laborSubtotal,riskValue,total:materialsSubtotal+materialProfitValue+laborSubtotal+riskValue};
 }
 global.HydroStarQuoteCalculator=Object.freeze({sumLines,calculate});
})(window);
