import React, { useState } from 'react';
import FleetOperationsDashboard from './FleetOperationsDashboard';
import VehicleDetailsView from './VehicleDetailsView';
import RechargeDesalinationModal from './RechargeDesalinationModal';
import AddFuelModal from './AddFuelModal';
import AddExpenseModal from './AddExpenseModal';
import AddVehicleModal from './AddVehicleModal';
import { useScrollToTop } from '../../utils/scrollUtils';

export const OperationsMainView: React.FC = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Guarantee that switching between fleet dashboard and vehicle details starts at top (0, 0)
  useScrollToTop([selectedVehicleId]);

  // Modals state
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [targetVehicleId, setTargetVehicleId] = useState<string | null>(null);

  const handleOpenRecharge = (vehId?: string) => {
    setTargetVehicleId(vehId || selectedVehicleId || null);
    setRechargeModalOpen(true);
  };

  const handleOpenAddFuel = (vehId?: string) => {
    setTargetVehicleId(vehId || selectedVehicleId || null);
    setFuelModalOpen(true);
  };

  const handleOpenAddExpense = (vehId?: string) => {
    setTargetVehicleId(vehId || selectedVehicleId || null);
    setExpenseModalOpen(true);
  };

  return (
    <div className="operations-scope max-w-4xl mx-auto px-3 sm:px-4">
      {selectedVehicleId ? (
        <VehicleDetailsView
          vehicleId={selectedVehicleId}
          onBack={() => setSelectedVehicleId(null)}
          onOpenRecharge={handleOpenRecharge}
          onOpenAddFuel={handleOpenAddFuel}
          onOpenAddExpense={handleOpenAddExpense}
        />
      ) : (
        <FleetOperationsDashboard
          onSelectVehicle={(vehId) => setSelectedVehicleId(vehId)}
          onOpenRecharge={handleOpenRecharge}
          onOpenAddFuel={handleOpenAddFuel}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenAddVehicle={() => setAddVehicleModalOpen(true)}
        />
      )}

      {/* Modals */}
      <RechargeDesalinationModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        preselectedVehicleId={targetVehicleId}
      />

      <AddFuelModal
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        preselectedVehicleId={targetVehicleId}
      />

      <AddExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        preselectedVehicleId={targetVehicleId}
      />

      <AddVehicleModal
        isOpen={addVehicleModalOpen}
        onClose={() => setAddVehicleModalOpen(false)}
      />
    </div>
  );
};

export default OperationsMainView;
