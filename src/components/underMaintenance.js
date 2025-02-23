import { el } from "../utils";

/**
    * @function underMaintenance
    * @description renders text showing that the app is under maintenance
 */
export const underMaintenance = (error) => {
    
    const apploader = document.getElementById("app_loader");
    apploader?.remove();

    const root = document.getElementById("root");
    const under_maintenance = el("div", "under-maintenance");
    const under_maintenance_content = el("div", "under-maintenance-content");
    const title = el("p", "under-maintenance-title");
    const description = el("p", "under-maintenance-description");
    const logo = el("img", "under-maintenance-logo");
    const errorMsg = el("p", "under-maintenance-erro");

    title.innerText = "The system is under maintenance.";
    description.innerText = "Please check in a few minutes";
    logo.src = "https://cdn.castify.ai/files/app/castify_watermark.png";

    under_maintenance_content.appendChild(title);
    under_maintenance_content.appendChild(description);
    under_maintenance_content.appendChild(logo);
    under_maintenance.appendChild(under_maintenance_content)
    root.appendChild(under_maintenance);
};

