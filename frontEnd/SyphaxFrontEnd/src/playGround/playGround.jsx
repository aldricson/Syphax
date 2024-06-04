// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Button } from '@mui/material';
import { observer } from 'mobx-react';
import  PlayGroundStore   from "../mobxStores/playGroundStore.jsx";

const playstore = new PlayGroundStore();

const PlayGroundComponent = observer (function PlayGroundComponent () {
    return (
        <div>
            <Button variant="contained" onClick={playstore.onButtonClicked}> Syphax </Button>
            <div>
                button is : {playstore.buttonStateAsText}
            </div>
        </div>
    )

});


export default PlayGroundComponent;
