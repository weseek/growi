export interface GrowiCommandsMappings{
  execSlashCommand(body:{[key:string]:string}):Promise<void>
}
