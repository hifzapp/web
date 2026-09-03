import Dashboard from "@/modules/app/dashboard";
import Onboarding from "@/modules/app/onboarding";

export default function Application(){
    return (
        <>
          <Dashboard />
          <Onboarding isSettings={false}/> 
        </>
    )
}