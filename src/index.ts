
import {Artifact} from "hardhat/types";
import {AddressLike, BigNumberish, getBytes, Interface, keccak256, Signer, solidityPackedKeccak256} from "ethers";

export function decodeFunctionResult(artifact: Artifact, data: string, functionName:string="run") {
    const scriptInterface = new Interface(artifact.abi);
    return scriptInterface.decodeFunctionResult(functionName, data)
}


/**
 * Converts an artifact into code executable on-chain in the HyVM.
 *
 * @param {Artifact} artifact - The contract artifact that contains the bytecode information.
 * @param {string} [functionSelector] - The four-byte selector of the function in the contract.
 *        Defaults to 'c0406226' (run()) if not provided.
 *
 * @returns An string containing the modified bytecode
 *
 * @description
 * The method modifies the contract's deployed bytecode by replacing the function selector and the calldata
 * size check opcode.
 *
 * Note: This function assumes the use of EVM compatible bytecode and hashing/signing methods.
 *
 * Example usage:
 * ```
 * const signer = new Wallet(privateKey, provider);
 * const artifact = getArtifact(contractName);
 * // Modified bytecode
 * const bytecode = getVMBytecodeSig(artifact)
 * ```
 */
export function getVMBytecode(artifact: Artifact, functionSelector: string="c0406226"): string {
    return artifact
        .deployedBytecode
        .replace(functionSelector, '00000000')
        // bypass the calldata size check
        .replace('6004', '6000')
}


/**
 * Converts an artifact into code executable on-chain in the HyVM, and returns it signed and hashed.
 *
 * @param {Signer} signer - An object representing the signer which provides methods to sign the message.
 * @param {Artifact} artifact - The contract artifact that contains the bytecode information.
 * @param {string} [functionSelector] - Optional - The four-byte selector of the function in the contract.
 *        Defaults to 'c0406226' (run()) if not provided.
 * @param {string} [nonce] - Optional - A nonce to associate with this signature (used for MultiSig).
 * @param {string} [contractAddress] - Optional - A contract address paired with this nonce to associate with this signature (used for MultiSig).
 *
 * @returns An object containing the modified bytecode, its hash, and the signature.
 *
 * @description
 * The method modifies the contract's deployed bytecode by replacing the function selector and the calldata
 * size check opcode.
 *
 * Note: This function assumes the use of EVM compatible bytecode and hashing/signing methods.
 *
 * Example usage:
 * ```
 * const signer = new Wallet(privateKey, provider);
 * const artifact = getArtifact(contractName);
 * getVMBytecodeSig(signer, artifact).then(result => {
 *   console.log(result.bytecode); // Modified bytecode
 *   console.log(result.hashedBytecode); // Hash of the modified bytecode
 *   console.log(result.sig); // Signature of the hash
 * });
 * ```
 */
export async function getVMBytecodeSig(signer: Signer, artifact: Artifact, functionSelector: string="c0406226", nonce:BigNumberish|undefined=undefined, contractAddress:AddressLike|undefined=undefined): Promise<{ bytecode: string; hashedBytecode: string; sig: string; }> {
    const bytecode = getVMBytecode(artifact, functionSelector)

    let hashedBytecode: string;


    let sig: string;

    if(nonce === undefined){
        hashedBytecode = keccak256(bytecode);
        sig = await signer.signMessage(getBytes(hashedBytecode));
    } else {
        hashedBytecode = solidityPackedKeccak256(
            ["bytes", "uint256", "address"],
            [bytecode, nonce, contractAddress]
        )
        sig = await signer.signMessage(getBytes(hashedBytecode));
    }

    return {bytecode, hashedBytecode, sig}
}