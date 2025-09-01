import Header from "@/components/Header";
import Donations66 from "@/components/Donations66";
import OtherDonations from "@/components/OtherDonations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Donations = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8 pb-24">
      <Tabs defaultValue="66" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="66">Dons 66%</TabsTrigger>
          <TabsTrigger value="other">Autres dons</TabsTrigger>
        </TabsList>
        <TabsContent value="66">
          <Donations66 />
        </TabsContent>
        <TabsContent value="other">
          <OtherDonations />
        </TabsContent>
      </Tabs>
    </main>
  </div>
);

export default Donations;
