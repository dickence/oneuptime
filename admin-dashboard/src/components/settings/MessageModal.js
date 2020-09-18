import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import ShouldRender from '../basic/ShouldRender';

const MessageModal = props => {
    const { closeThisDialog, testError } = props;

    return (
        <div
            onKeyDown={e => e.key === 'Escape' && closeThisDialog()}
            className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center"
        >
            <div
                className="ModalLayer-contents"
                tabIndex={-1}
                style={{ marginTop: 40 }}
            >
                <div className="bs-BIM">
                    <div
                        className="bs-Modal bs-Modal--medium"
                        style={{ minWidth: '400px' }}
                    >
                        <div className="bs-Modal-header">
                            <div className="bs-Modal-header-copy">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>Info</span>
                                </span>
                            </div>
                        </div>
                        <div className="bs-Modal-content">
                            <ShouldRender if={testError}>
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    Test failed
                                </span>
                            </ShouldRender>
                            <ShouldRender if={!testError}>
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    Test is successful
                                </span>
                            </ShouldRender>
                        </div>
                        <div className="bs-Modal-footer">
                            <div className="bs-Modal-footer-actions">
                                <button
                                    id="confirmDelete"
                                    className="bs-Button"
                                    onClick={closeThisDialog}
                                >
                                    <span>Ok</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

MessageModal.displayName = 'MessageModal';

MessageModal.propTypes = {
    closeThisDialog: PropTypes.func,
    testError: PropTypes.string,
};

const mapStateToProps = state => {
    return {
        testError: state.settings.error,
    };
};

export default connect(mapStateToProps, null)(MessageModal);
