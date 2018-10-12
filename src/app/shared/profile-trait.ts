/**
 * Public methods to manage a Solid profile
 */
export interface ProfileTrait {

    /**
     * Serialises the profile using 'text/turtle'
     * @return {string}
     */
    toTurtle: () => string
}
