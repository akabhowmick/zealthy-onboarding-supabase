import AdminConfigForm from "../features/admin/AdminConfigForm";

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin: Configure Onboarding</h1>
      <p className="text-sm text-gray-600">
        Choose which components appear on pages 2 and 3. Each page must have at least one.
      </p>
      <AdminConfigForm />
    </section>
  );
}
