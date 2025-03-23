export interface RecipeOrderRecipient {
    id: number;
    userId: number;
    recipeOrderId: number;
    user?: SysUser;
}

// Add import at the top of the file
import { SysUser } from './sys-user'; 